---
title: Mail API
description: Build clients and automations on HQBase's stable, versioned mail API.
---

HQBase exposes a stable HTTP API for mail clients, command-line tools, automations, and agents. The
HQBase web app uses the same API, so external clients follow the same mailbox access, validation,
threading, attachment, and sending rules as the product UI.

The current base path is `/api/v2`. The supported `/api/v1` compatibility surface remains available
for existing clients. Both versions cover mailboxes, messages, conversations, attachments, drafts,
sending, replying, and forwarding. They do not expose workspace administration, people,
invitations, domains, setup, updates, audits, sessions, notifications, app secrets, or Cloudflare
credentials.

## Mail API versions

New clients use `/api/v2`. Existing `/api/v1` clients and their audience-bound OAuth grants can
continue without reconnecting. A v1 token works only with v1, and a v2 token works only with v2.
Each version has its own protected-resource metadata and OpenAPI document.

Both versions use the one-address-per-mailbox model. V2 returns that mailbox directly, including
its `mailDomainId`, `kind`, and `deletedAt` fields. V1 returns its earlier mailbox shape with an
`addresses` list. That compatibility list always contains one primary address whose `id` and
`mailboxId` equal the mailbox identifier. Its `receiveEnabled` and `sendEnabled` values equal the
mailbox's `isActive` value. The v1 response does not group separate mailboxes back into aliases.

During the upgrade, each old additional address becomes a mailbox with a copy of the source
mailbox's access grants and retention policy. The new mailbox stays active only if the source
mailbox was active and the address could both receive and send; otherwise, it is disabled. Existing
mail and drafts move to the mailbox for their exact receiving or sending address. Threads and
attachments stay intact. Default-sender and catch-all settings stay on the original mailbox.

### Upgrade a client from v1 to v2

Existing v1 clients can upgrade when convenient:

1. Change the API base, protected-resource metadata, OpenAPI, and WebSocket URLs from `/api/v1` to
   `/api/v2`.
2. Request the `/api/v2` OAuth resource and ask the person to approve it. A v1 token cannot be used
   with v2.
3. Read the mailbox's `address`, `mailDomainId`, `kind`, and `deletedAt` fields directly. Do not read
   an `addresses` list.
4. Verify mailbox listing, synchronization, and sending with v2. Then remove the client's v1 token
   and configuration.

## Authentication

HQBase accepts an HQBase session cookie or human OAuth token on `/api/v1` and `/api/v2`. V2 also
accepts a mailbox-agent credential:

- The web app uses its HTTP-only HQBase session cookie.
- External clients acting for a person use an OAuth bearer token issued by the same HQBase
  installation.
- A mailbox agent uses a revocable bearer credential created with the agent. An owner, admin, or
  approved provisioner can create it. This credential is not OAuth and HQBase shows it only once.

OAuth clients discover the installation's authorization server at
`/.well-known/oauth-authorization-server/api/auth`. Protected-resource metadata is available at
`/.well-known/oauth-protected-resource/api/v1` and
`/.well-known/oauth-protected-resource/api/v2`. The protected resource and token audience are the
installation origin followed by the selected API version, for example
`https://mail.example.com/api/v2`.
Protected-resource metadata identifies the API as **HQBase Mail API** and links its
`resource_documentation` to the installation's generated human-delegated Agent Skill at
`/skills/hqbase-mail/SKILL.md`.

HQBase supports OAuth dynamic client registration, Device Authorization Grant, and Authorization
Code with PKCE. Device Authorization is the preferred flow for AI tools acting for a person,
command-line tools, and other clients that cannot safely receive a browser callback. PKCE remains
available for clients that can receive one.

A public client registers with token endpoint authentication method `none`; it must not embed a
client secret. The authorization server's discovery document supplies the registration,
authorization, device-authorization, and token endpoints. Clients request the API resource when
registering and authorizing so the resulting token cannot be replayed against MCP or another
service.

A mailbox agent credential is bound to its machine principal and the `/api/v2` resource. It does
not create a browser session, use an OAuth refresh token, or work with MCP. A provisioner credential
is instead bound to `/management/v1` and does not work with this API. The provisioner does receive
each child mailbox agent credential once, so it is a trusted credential issuer. It can list only
the mailbox agents that it created and replace a lost child credential. Replacement revokes the
old credential. Disabling an agent makes its credentials fail on the next request.

### Device Authorization Grant

The client registers `urn:ietf:params:oauth:grant-type:device_code`, requests a device code from
`/api/auth/device/code`, shows the returned short `user_code` and `verification_uri` to the person,
and polls `/api/auth/oauth2/token` at no less than the returned `interval`. The client presents the
verification URL as a clickable link but does not open it in Cloud Browser or another remote,
automated, or agent-controlled browser. The person opens the verification URL in a browser they
control, signs in to HQBase if necessary, verifies that the displayed code, client, permissions,
and Mail API resource match the request, and chooses **Allow** or **Deny**. The client does not
receive HQBase credentials, browser cookies, or a callback URL.

The authorization request and token exchange both include the selected version's Mail API
resource.
Pending, denied, expired, and over-frequent polls use the standard `authorization_pending`,
`access_denied`, `expired_token`, and `slow_down` OAuth errors. A device code is short-lived,
single-use, bound to its registered client and resource, and cannot be approved by a different
signed-in person after it has been claimed. The client stops polling after success, denial, or
expiry and never logs the device code, user code, access token, refresh token, or mail content.

User-code verification is limited to five attempts per connecting IP in each 15-minute window.
HQBase stores the counter in the installation's D1 database so the limit applies across Worker
isolates and restarts. The connecting IP is HMAC-hashed before storage; the user code is never used
as a rate-limit key.

Device Authorization removes the need for a callback or local browser listener. It does not remove
the person's HQBase sign-in or explicit permission approval, and it does not bypass a host
application's own confirmation before running commands or making network requests.

### Authorization Code with PKCE

A callback-capable public client registers `authorization_code`, opens the authorization endpoint
with PKCE and the Mail API resource, receives the browser callback, and exchanges the one-time code
at the token endpoint. PKCE clients follow the same permissions, resource binding, consent, and
revocation rules as device clients.

Native desktop and mobile clients that use Authorization Code with PKCE must register with
`application_type` set to `native`. HQBase accepts the native redirect forms defined by RFC 8252:
app-claimed HTTPS, loopback HTTP, and private-use schemes. A private-use redirect must use a
reverse-domain scheme with no authority component, for example `com.example.mail:/oauth/callback`.

| Permission | What it allows |
| --- | --- |
| `mail:read` | List visible mailboxes and conversations, search and open mail, render message HTML, and download attachments. |
| `mail:write` | Trust a sender's remote media and mark mail read or unread, add or remove stars, archive or unarchive mail, move it to Trash, and restore it. |
| `mail:send` | Manage drafts and draft attachments, send new mail, reply, and forward. |
| `signatures:manage` | List, create, change, and delete signatures within the person's current management access. |
| `offline_access` | Ask the authorization server for an optional refresh token. It is not an API endpoint permission. |

For a machine credential, `mail:read`, `mail:write`, and `mail:send` are credential capabilities,
not OAuth permissions. `offline_access` never applies to a machine credential.

OAuth tokens are further limited by the connected person's current account and mailbox access.
Machine credentials are limited by the agent's capabilities and exact mailbox grants. The most
limited result wins. Revoking consent, banning a person, requiring password setup, disabling an
agent, or changing mailbox access takes effect on the next request. Tokens with `offline_access`
in both the token and current consent can outlive the approving browser session. Browser sign-out
can invalidate an access token; the client can use its refresh token to continue. Tokens without
`offline_access` require an active approving session. Password reset revokes all OAuth tokens and
approvals.
Use **Settings > Connections** to revoke an app's access. Offline access does not extend the
browser session or remove the access-token and refresh-token expiry limits.

HQBase rotates refresh tokens. A second matching refresh request that uses the previous token
within 30 seconds returns the same rotated token response. Reuse after that window remains a replay
and invalidates the refresh-token family.

The signed-in product UI lists a person's OAuth connections through `GET /api/oauth-connections`.
`DELETE /api/oauth-connections/{client-id}` removes every consent, access token, and refresh token
for that person-client pair in one operation. These routes are private product routes, not Mail API
routes. They never let one person list or revoke another person's connection.

## Endpoints

All paths below are available relative to `/api/v1` and `/api/v2`. New clients use `/api/v2`.

| Method and path | Permission | Purpose |
| --- | --- | --- |
| `GET /mailboxes` | `mail:read` | List active mailboxes visible to the caller. Owners and admins may see active mailbox metadata for access management without receiving its mail. |
| `GET /messages` | `mail:read` | List or search messages with cursor pagination, optionally filtered by mailbox or folder. |
| `GET /changes` | `mail:read` | Read message upserts and deletion tombstones after a sync checkpoint. |
| `GET /events` | `mail:read` | Open a WebSocket that wakes clients when a synchronization feed can have new work. |
| `GET /messages/{id}` | `mail:read` | Get one message. |
| `GET /messages/{id}/thread` | `mail:read` | Get the accessible messages in the same thread. |
| `GET /messages/{id}/html` | `mail:read` | Get sanitized HTML rendering metadata, including visible content before and after any separately returned quoted reply history and remote-image flags for each fragment. |
| `GET /messages/{id}/inline/{attachmentId}` | `mail:read` | Render a safe inline image from a message. |
| `GET /attachments/{id}` | `mail:read` | Download an attachment. |
| `GET /conversations` | `mail:read` | List or search conversation summaries with cursor pagination. |
| `GET /labels` | `mail:read` | List workspace labels visible to the caller. |
| `PUT /messages/{id}/labels/{labelId}` | `mail:write` | Add a label to one organizable message. |
| `DELETE /messages/{id}/labels/{labelId}` | `mail:write` | Remove a label from one organizable message. |
| `PUT /conversations/{id}/labels/{labelId}` | `mail:write` | Add a label to accessible organizable messages in a conversation. |
| `DELETE /conversations/{id}/labels/{labelId}` | `mail:write` | Remove a label from accessible organizable messages in a conversation. |
| `PUT /drafts/{id}/labels/{labelId}` | `mail:send` | Add a private label to one draft owned by the caller. |
| `DELETE /drafts/{id}/labels/{labelId}` | `mail:send` | Remove a private label from one draft owned by the caller. |
| `POST /messages/{id}/{action}` | `mail:write` | Apply `read`, `unread`, `star`, `unstar`, `archive`, `unarchive`, `trash`, or `restore`. |
| `POST /messages/{id}/remote-media/trust` | `mail:write` | A person can trust the message sender's remote images. Machine agents cannot change this preference. |
| `POST /conversations/{id}/{action}` | `mail:write` | Apply a message action to the accessible part of a conversation. |
| `GET /drafts` and `GET /drafts/{id}` | `mail:send` | List one cursor page or get one of the caller's drafts. |
| `GET /drafts/changes` | `mail:send` | Read draft upserts and deletion tombstones after a sync checkpoint. |
| `POST /drafts` | `mail:send` | Create a draft. |
| `PATCH /drafts/{id}` | `mail:send` | Update a draft using its current version. |
| `DELETE /drafts/{id}` | `mail:send` | Delete a draft and its stored attachments. |
| `POST /drafts/{id}/attachments` | `mail:send` | Add one multipart attachment or inline image to a draft. |
| `GET /drafts/{draftId}/attachments/{id}/inline` | `mail:send` | Render one safe inline draft image for its author. |
| `DELETE /drafts/{draftId}/attachments/{id}` | `mail:send` | Remove a draft attachment. |
| `POST /send` | `mail:send` | Send a new message. |
| `POST /reply` | `mail:send` | Reply to an existing message. |
| `POST /forward` | `mail:send` | Forward an existing message with optional staged and original attachments. |

`GET /conversations` excludes messages in Trash unless `folder=trash`. With that filter, it uses
only messages in Trash. The summary message, message count, unread count, star state, and attachment
state use this same visible set.

Mailbox access still applies after OAuth permission or machine-capability checks. Read access is
required to receive mail content, **Handle mail** access is required for organization and sending
actions, and Manager access is not granted by this API. **Handle mail** uses the internal value
`agent`. Owners retain Manager access to every mailbox. An admin without mailbox access can see
mailbox metadata but cannot read, change, or send its mail.

Each mailbox has a stable `kind`: `human` for an ordinary mailbox or `agent` for a dedicated
mailbox created with a mailbox agent. Giving an agent access to an existing human mailbox does not
change that mailbox's kind.

Soft-deleted mailboxes and their messages, drafts, and attachments do not appear through the Mail
API. Their stored data remains subject to the current retention rules. Restoring the mailbox makes
the same mailbox ID and mail available again under its current access rules.

An exact active mailbox address always receives inbound mail before the domain's unmatched-mail
policy is considered. A domain can reject unmatched mail, keep it as unassigned mail, or deliver it
to one active human mailbox on that domain. Mail delivered to the selected mailbox is normal Inbox
mail and uses that mailbox's REST, MCP, notification, and changes-feed access. It records the exact
envelope recipient, but that unmatched address is not a sending identity.

Unassigned mail has no mailbox grant. Only an owner can list, read, change, or download it through
the REST API or MCP. The stored unassigned state stays authoritative after an owner archives,
unarchives, trashes, or restores the message. A null mailbox reference by itself does not grant
catch-all access, and a missing message still returns `404`.

The changes feed applies the same live rule. An unassigned deletion tombstone has a null
`mailboxId`; only owners receive it.

### Message search

The `search` value is one literal substring. HQBase searches the subject, sender address, To
recipients, snippet, and plain-text body. The characters `%`, `_`, and `\` are ordinary search
text. They do not enable wildcards or escapes. Mailbox access and the requested mailbox and folder
filters still apply, and search does not change the activity-time order used by pagination.

`labelId` remains the optional single-label message, conversation, and draft filter. Repeat
`labelIds` to require more than one label. The server combines and deduplicates both parameters with
mailbox, folder, and literal search filters. A message or draft must carry every requested label. A
conversation matches when its accessible messages collectively carry every requested label.
An unknown label returns `404 LABEL_NOT_FOUND`; a label never broadens mailbox access.

### Labels

V2 includes label membership in message, thread, conversation, and message-change responses.
V1 includes the same fields when the request has `includeLabels=true`. The parameter is supported
on `GET /messages`, `/messages/{id}`, `/messages/{id}/thread`, `/conversations`, and `/changes`.
Message action responses also accept this option. Message next-page links keep the option.
Without that exact value, v1 keeps its existing response shape. This parameter does not filter the
changes feed or change its cursor. Draft responses include labels on both versions without an
opt-in parameter.

Labels are workspace organization, not folders or access controls. `GET /labels` is available to
human OAuth and machine mailbox clients with `mail:read`. A caller with `mail:write` can add or remove
an existing label only where its live mailbox grant permits mail organization. Conversation label
actions update accessible organizable messages and leave inaccessible copies unchanged.

Draft responses include a `labels` array. A caller with `mail:send` can add or remove an existing
label only on a draft that it owns and can still access. Draft label changes appear in the private
draft changes feed. They do not change a related conversation before send. After a successful
saved-draft send, HQBase copies the assignments to the new outbound message before it deletes the
draft. Deleting a draft removes its assignments.

Label-definition management remains in owner/admin installed-app routes. Machine credentials and
OAuth Mail API tokens cannot create, rename, recolor, or delete workspace labels.

### Signatures

`GET /signatures?from=<exact-address>` requires `mail:send` and returns only personal, mailbox, and
exact-domain signatures usable from that address, plus the automatic signature ID. Draft create and
update requests accept an optional `signature` object with mode `automatic`, `selected`, or `none`;
selected mode also requires an ID. Draft responses include the saved mode and sanitized snapshot.

Direct send, reply, and forward requests accept the same optional object. When it is present, HQBase
resolves and snapshots the signature before message assembly. When it is omitted, the supplied body
is unchanged. This preserves existing clients.

Draft inputs use `SignatureSelection`; draft responses use `SignatureSnapshot`. The shared
`DraftFields` schema has no signature property. A snapshot can have mode `selected` with a null ID
after signature deletion. The saved content remains in the draft. A save without a signature
selection keeps the snapshot when the From address is unchanged. Changing the From address resolves
that deleted selection through the automatic rules.

Signature management is available on both versions with the separate `signatures:manage` OAuth
permission, or a browser session. `mail:send` alone does not permit management. Machine credentials
cannot manage signatures. The client registration must allow the management permission. Existing
grants need new consent for that permission.

| Endpoint | Result |
| --- | --- |
| `GET /signatures/manage` | List signatures the person can manage. |
| `POST /signatures` | Create a signature; return `201`. |
| `PATCH /signatures/{id}` | Change a signature; return `200`. |
| `DELETE /signatures/{id}` | Delete a signature; return `204`. |

Create accepts `name`, `html`, `scope: {type, id}`, and optional `isDefault`. Scope type is `user`,
`mailbox`, or `domain`. Update accepts one or more of `name`, `html`, and `isDefault`. A person can
manage only their own personal signatures, mailbox signatures where they have Manager access, and
domain signatures if they are an owner or admin. The existing sanitizer, inline-image limits, and
content-free audit records apply. HTML input is limited to 400,000 characters. Invalid content returns
`400 SIGNATURE_INVALID`; denied access returns `403 SIGNATURE_FORBIDDEN`; a missing signature returns
`404 SIGNATURE_NOT_FOUND`; a duplicate name within the scope returns `409 SIGNATURE_NAME_CONFLICT`.

### Message actions

`read`, `unread`, `star`, and `unstar` do not change the current folder. `trash` moves the selected
message or the accessible messages represented by the active conversation folder to Trash.
`unarchive` is valid only for mail in Archived. It clears the archive timestamp, then returns
inbound mail to Inbox, outbound mail to Sent, and unassigned mail to Catch-all. `restore` is valid
only for mail in Trash. It clears the trash and archive timestamps, then returns mail to the same
active folders.

At conversation level, `archive` moves accessible Inbox and Catch-all messages to Archived. It does
not move Sent or Trash messages. `unarchive` applies only to accessible Archived messages
represented by the active Archived folder. An action that does not match any message returns `200`
with `affected: 0`. Clients must not remove a conversation optimistically when `affected` is zero.

### Message attachments

Each attachment in a message detail response includes `disposition` as `attachment` or `inline`.
Clients must use this value to distinguish downloadable files from parts rendered inside the
message body. A content ID does not make a part inline by itself because Gmail and other senders can
give ordinary downloadable attachments a content ID.

### Draft attachments

`POST /drafts/{id}/attachments` accepts one `file` part and an optional `inline` part. HQBase records
the file's `Content-Type`. If the file has no type, HQBase records `application/octet-stream`. When
`inline` is `true`, the file must be a safe raster image. The returned attachment has `inline: true`
and can be previewed only through
`GET /drafts/{draftId}/attachments/{id}/inline` by the draft owner.

To place that image in draft HTML, a client uses the matching API-version path as its `src`, for
example `/api/v2/drafts/{draftId}/attachments/{id}/inline`, and includes the attachment ID in the
send request. HQBase verifies the draft, image, and caller again, then replaces the private path with
a `cid:` reference and sends the image as an inline MIME part. It does not send an unreferenced
inline image.

A file can be at most 25 MiB, and all attachments in one draft can total at most 25 MiB. An upload
that exceeds either limit returns `413 ATTACHMENTS_TOO_LARGE`. Send, reply, and forward requests can
name at most 20 staged attachments. Inline images, signature images, and ordinary attachments share
the 20-file and 25-MiB send limits.

### Draft pagination and changes

`GET /drafts` returns one page as a JSON array. Drafts are ordered by `updatedAt`, newest first,
then by descending identifier. `limit` is an integer from 1 to 100 and defaults to 100. When more
draft rows follow, the response includes an RFC 8288 `Link` header with `rel="next"`. The last page
has no `Link` header. The cursor is opaque and is valid only for the draft list.

`GET /drafts/changes` is a separate synchronization feed for private drafts. It uses the same
checkpoint, bounded high-water cycle, `limit`, `nextCursor`, and `hasMore` rules as the message
changes feed. Its cursor is separate from message and list cursors. An upsert contains the current
public `Draft` object. A delete is a tombstone:

```json
{ "type": "delete", "draftId": "drf_example" }
```

Creating or editing a draft, adding or removing an attachment or label, sending a saved draft, and
deleting a draft all write to the draft journal. The monotonic sequence keeps rapid changes
distinct and keeps deletion records after the draft row is removed. HQBase applies the caller's
current draft ownership and mailbox access before it returns an upsert. When mailbox access
changes, a client repeats the full draft bootstrap so drafts that became hidden or visible are
reconciled.

A new client uses this bootstrap order:

1. Request a draft-changes checkpoint without a cursor and keep its `nextCursor`.
2. Paginate the full draft list.
3. Request draft changes after the checkpoint until `hasMore` is `false`.

HQBase keeps draft-journal rows in this API version. Future bounded retention must return `410`
with `DRAFT_CHANGE_CURSOR_EXPIRED` instead of silently skipping changes. Invalid list cursors
return `400 INVALID_DRAFT_CURSOR`. Invalid change cursors return
`400 INVALID_DRAFT_CHANGE_CURSOR`. An invalid limit returns `400 INVALID_LIMIT`.

Drafts are not message rows. HQBase keeps `drafts` in the message-folder enum for compatibility,
but current write paths do not store messages in that folder. Clients use `/drafts` and
`/drafts/changes` for a Drafts folder. The conversation-folder enum omits `drafts` because drafts
are private composer state, not conversations.

A draft belongs to the person or machine agent that created it. Another principal cannot list,
open, edit, label, attach files to, or send that draft, even when both principals can use the same
mailbox.

### Message pagination

`GET /messages` returns one page of messages as a JSON array. `limit` sets the page size. It is an
integer from 1 to 100 and defaults to 100. Messages are ordered by activity time, newest first,
where activity time is the received time, then the sent time, then the creation time. Messages with
the same activity time are ordered by descending identifier, so the order stays stable across a page
boundary.

Message summaries and details keep `fromAddress` as the exact email address. They also return the
nullable `fromName` field. It contains the decoded display name supplied by an inbound message or
the mailbox sender name used for an outbound message. Clients must treat it as untrusted display
text and continue to use `fromAddress` for address matching and replies.

When more messages follow the page, the response includes an RFC 8288 `Link` header of the form
`<url>; rel="next"`. The URL keeps the `mailboxId`, `folder`, `search`, and `limit` values of the
request and adds a `cursor`. A client follows that URL to read the next page. The last page has no
`Link` header.

A cursor is opaque and versioned. Clients must return it unchanged and must not construct, parse, or
edit one. A cursor from another list, such as a conversation cursor, is not valid here. A cursor
never widens message access: every page is filtered by the mailboxes the caller can read
and the owner-only rule for unassigned mail.

A `limit` that is not an integer from 1 to 100 returns `400` with the error code `INVALID_LIMIT`. A
malformed or foreign cursor returns `400` with the error code `INVALID_CURSOR`.

### Message changes

`GET /changes` returns message changes in journal order. It is a synchronization feed, not a
message-history endpoint. The feed has no mailbox, folder, or search filter. This rule makes a
folder move visible as one upsert with the message's current folder.

The response is a JSON object:

```json
{
  "changes": [
    { "type": "upsert", "message": {} },
    {
      "type": "delete",
      "messageId": "msg_example",
      "mailboxId": "mbx_example"
    }
  ],
  "nextCursor": "opaque-cursor",
  "hasMore": false
}
```

An `upsert` contains the current public message-summary shape used by `GET /messages`. It does not
contain object-storage keys or other internal fields. A `delete` is a tombstone with only the
deleted message and mailbox identifiers. A client applies the changes in their returned order.

`limit` sets the maximum number of journal entries read for one page. It is an integer from 1 to
100 and defaults to 100. HQBase can return fewer changes when an older upsert has been replaced by
a later deletion. `hasMore` reports whether more journal entries remain in the bounded change
cycle, not whether the `changes` array reached `limit`.

The change cursor is opaque and versioned. Clients must return it unchanged and must not construct,
parse, or edit it. HQBase orders the journal with a monotonic sequence, not with timestamps. This
keeps two rapid changes distinct and keeps deletion records after the message row is removed.

A request without `cursor` is a checkpoint request. It returns no historical changes,
`hasMore: false`, and a `nextCursor` at the current journal high-water sequence. A new client uses
this bootstrap order:

1. Request a changes checkpoint and keep its `nextCursor`.
2. Paginate the full message list.
3. Request changes after the checkpoint until `hasMore` is `false`.

When a change cycle starts, HQBase fixes its high-water sequence. Page cursors keep that upper
bound. The last page advances `nextCursor` to the high-water sequence. Changes written during
paging belong to the next cycle, so one cycle stays bounded.

HQBase applies the caller's current mailbox access to each journal entry. Before each
change cycle, the client lists `GET /mailboxes`. It removes cached mail for mailboxes that are no
longer readable and performs a new full bootstrap for each newly readable mailbox. Stored mailbox
identifiers let HQBase authorize deletion tombstones after the message row is gone.

HQBase keeps change-journal rows in this API version. A future release can add bounded retention,
but it must return `410` with `CHANGE_CURSOR_EXPIRED` when a cursor is older than the retained
journal. The client then starts a new full bootstrap. HQBase never silently skips an expired range.

An invalid `limit` returns `400` with `INVALID_LIMIT`. A malformed or foreign change cursor returns
`400` with `INVALID_CHANGE_CURSOR`. A mailbox, folder, or search filter returns `400` with
`INVALID_CHANGE_FILTER`.

### Change notifications

`GET /api/v1/events` and `GET /api/v2/events` upgrade an authenticated HTTP request to a WebSocket.
This is a wake-up channel, not a second data API. An OAuth token needs `mail:read` for the selected
API audience. A v2 machine credential also needs `mail:read`. The web app can use its same-origin
HQBase session cookie. A cookie-authenticated upgrade must include an `Origin` header that exactly
matches the HQBase installation origin. A missing or different origin returns
`403 ORIGIN_FORBIDDEN`. Bearer connections do not depend on the `Origin` header and can omit it.

The server sends JSON text frames in this form:

```json
{ "type": "changed", "topic": "messages" }
```

The topic is one of:

- `messages` — read `/changes` from the client's last message cursor until `hasMore` is `false`.
- `drafts` — read `/drafts/changes` from the client's last draft cursor until `hasMore` is `false`.
- `mailboxes` — list `/mailboxes` again and apply the documented access-change bootstrap rules.
- `labels` — list `/labels` again and refresh visible label filters and assignments.

The server sends only topics permitted by the connection. A bearer connection always needs
`mail:read`; it receives the `drafts` topic only when its token also has `mail:send`. A session
connection can receive all four topics. Events contain no mail content, identifiers, counts,
cursor values, or mailbox names.

The authorization decision at upgrade is an event-delivery lease for 10 minutes. Revoking a bearer
credential or OAuth consent, disabling an agent, or ending a web session does not close the existing
socket immediately. The server closes the socket when the lease ends. Reconnection must use current
credentials and permissions. Mailbox visibility is checked for each message event. After a mailbox
grant is removed, the connection can receive the `mailboxes` wake-up needed to reconcile its cache,
but it receives no later `messages` event for mail that is no longer visible.

Events can be repeated, combined by the client, delayed, or lost when a connection closes. After
opening or reopening a connection, the client drains each synchronization feed that it uses before
it waits for an event. After an event, it drains the named feed again. This rule closes the race
between the last checkpoint and WebSocket setup. A client that does not use WebSockets continues to
converge by polling the journals.

Clients reconnect with bounded exponential backoff. The server can close a connection at any time,
including for deployment, authentication renewal, or resource control. An `Upgrade` request that
does not request `websocket` returns `426 WEBSOCKET_UPGRADE_REQUIRED`.

If the event service is not configured or cannot accept the upgrade, an authenticated request
returns `503 EVENT_SERVICE_UNAVAILABLE` or `503 EVENT_CONNECTION_FAILED` with an `X-Request-Id`.
The server records only a stable diagnostic code and the request ID. It does not log credentials,
mail content, or request headers. This failure does not stop the HTTP synchronization journals.

A connected client can send the exact text frame `ping`; the server replies with the exact text
frame `pong`. Clients can use this application heartbeat to detect a connection that stopped
delivering data. The heartbeat carries no mail or authentication data. A client closes and
reconnects a socket that does not answer within its heartbeat deadline.

The web app checks synchronization state every two minutes while its event socket is connected,
so a lost wake-up does not need to wait for the socket lease to end. These checks keep loaded
conversation pages and active composer input. Draft refreshes read the draft journal after one
initial snapshot; access changes start a fresh snapshot. While the socket is unavailable,
a successful fallback refresh keeps
the app usable while it reconnects. A failed fallback refresh means that neither live events nor
the HTTP API is available. Opening a socket stops fallback polling and drains the synchronization
feeds again. A connected socket can miss a wake-up if notification delivery fails. Another event
can recover the change sooner. The lease expires no later than 10 minutes after upgrade and forces
a reconnect; the next successful connection drains all feeds. Normal socket reconnects and
successful fallback synchronization stay silent. The web app shows a **Connection lost** dialog
only after fallback synchronization also fails, which means that neither path is available.
Recovery closes the dialog automatically.

Socket setup, reconnection, and fallback synchronization do not replace active local input. In
particular, they do not reinitialize an open composer, discard unsaved edits, or create another
draft for the same composer session.

HQBase routes authenticated connections through a hibernating Durable Object. Successful message,
draft, mailbox, and mailbox-access mutations notify it after the durable database write. If a
notification attempt fails, the publisher waits 100 milliseconds and then 200 milliseconds before
up to two retries. Duplicate wake-ups are safe. Failure after all three attempts never rolls back
accepted mail or a completed mutation because the journals and lease reconnect remain the recovery
path. The Durable Object does not poll D1 and does not use timers to keep connections open. It
answers the application heartbeat through the runtime's hibernating WebSocket auto-response.

## Requests and errors

JSON requests use `Content-Type: application/json`. Draft attachment uploads use
`multipart/form-data`. List endpoints use the documented query parameters in the OpenAPI document;
message and conversation cursors are opaque and clients must return them unchanged.

JSON bodies are limited to 2 MiB before parsing. Draft upload requests are limited to 26 MiB,
including multipart metadata; attachment content remains limited to 25 MiB. An oversized request
returns `413 REQUEST_TOO_LARGE`. A JSON request with another media type returns
`415 UNSUPPORTED_MEDIA_TYPE`. Unsafe session-authenticated methods require an `Origin` equal to
the request URL's origin. A missing, null, or different origin returns `403 ORIGIN_FORBIDDEN`.
Bearer-token clients do not need an origin header.

JSON errors have an `error` object with stable `code` and human-readable `message` fields. A missing
or invalid token returns `401`. A valid token without the required permission returns `403`.
Authentication errors include a `WWW-Authenticate` challenge containing the required scope and a
link to the protected-resource metadata. Every response includes `X-Request-Id`; API JSON responses
are not stored by shared caches.

Sending, replying, and forwarding accept an optional `idempotencyKey` of up to 100 characters.
Reuse that key only for the same request and principal. A saved draft also identifies one send
operation. A repeated identified operation never calls the provider again: it returns the stored
result, completes an accepted operation's storage, or reports that its delivery is still pending
or uncertain. If retention removed the sent message, the completed operation returns
`410 SEND_RESULT_UNAVAILABLE` and is not sent again. A different request under the same key returns
a conflict. Without a draft or key,
a repeated request can still send more than once and must not be retried blindly. State and draft
operations use the returned state or draft version to avoid overwriting newer work.

Message detail includes an optional `replyTo` address list. Replies use it when no explicit
recipient list is supplied. Full plain-text message detail is loaded from R2 when necessary;
search covers the first 256 KiB of plain text plus the existing searchable headers and snippet.

Clients use the changes feed for normal message synchronization and the event WebSocket only to
wake that process sooner. They still use full message and conversation listings for bootstrap,
access changes, and recovery after an expired cursor.

## Stability policy

`/api/v2` is the current stable public mail API. `/api/v1` is a supported compatibility API over
the same mailbox and mail data. Within either version, HQBase may add endpoints, optional request
fields, response fields, and error codes. Clients must ignore response fields they do not
understand. HQBase will not remove or rename an endpoint or field, make an optional request field
required, change the meaning of existing data, or broaden an existing enum in a way that changes
client behavior without introducing a new API version.

Security fixes can make previously accepted unauthorized or invalid requests fail. Operational
limits can also be tightened to protect an installation, with a documented error response.

When a breaking version is necessary, it receives a new base path such as `/api/v3`. The release
notes and this specification document the migration, support policy, and any deprecation window
before HQBase removes a supported public version. The
unversioned `/api/*` routes are product-internal compatibility routes and are not covered by this
stability promise.

## Agent skills, OpenAPI, and human testing

Every HQBase installation publishes three public, instruction-only Agent Skills:

| Skill | Path | Purpose |
| --- | --- | --- |
| Connected app | `/skills/hqbase-mail/SKILL.md` | Use human OAuth with the Mail API. |
| Mailbox agent | `/skills/hqbase-mailbox/SKILL.md` | Use one mailbox-agent credential with the Mail API. |
| Provisioner | `/skills/hqbase-provisioner/SKILL.md` | Use one provisioner credential with the Management API. |

Each file starts with the required `name` and `description` YAML frontmatter. A skill contains the
installation's canonical URLs, permission rules, and safety requirements. It either lists the
available methods or links to them. It contains no credential, account data, or mail content.

The old `/AGENTS.md` and `/agents.md` paths return a short `200` retirement notice. The notice
reads: **This file is retired. Open Agents in HQBase to choose the correct Agent Skill or MCP
server.** The **Agents** section is the authoritative connection guide.

The same installation serves instance-adjusted OpenAPI documents at `/api/v1/openapi.json` and
`/api/v2/openapi.json`. Their `servers` entries and external documentation links use the
installation's canonical origin. Both documents are public, contain no account data or credentials,
and support `GET` and `HEAD`.

The canonical current machine-readable contract is the
[OpenAPI 3.1 document](https://github.com/HQBase/hqbase/blob/main/api/hqbase-mail-api-v2.openapi.json).
The repository also publishes the
[v1 compatibility document](https://github.com/HQBase/hqbase/blob/main/api/hqbase-mail-api-v1.openapi.json).
Generated [v1](https://github.com/HQBase/hqbase/blob/main/api/hqbase-mail-api-v1.postman_collection.json)
and [v2](https://github.com/HQBase/hqbase/blob/main/api/hqbase-mail-api-v2.postman_collection.json)
Postman collections include importable
[v1](https://github.com/HQBase/hqbase/blob/main/api/hqbase-mail-api-v1.postman_environment.json)
and [v2](https://github.com/HQBase/hqbase/blob/main/api/hqbase-mail-api-v2.postman_environment.json)
environment templates.

Set the environment's `base_url` to the canonical origin of your installation. Use the collection's
OAuth setup requests to inspect discovery and dynamically register a public client, then complete
Authorization Code with PKCE in Postman and keep the access token in a local, unsynced environment.
Do not publish tokens, API responses, or mail content in a shared collection or workspace.

The checked-in collection and environment are generated from the OpenAPI contract. HQBase's test
suite rejects artifact drift and verifies cookie authentication, bearer authentication, OAuth
audience and permission enforcement, Device Authorization polling and approval boundaries, live
mailbox access, stable error challenges, and the web app's use of the versioned routes. It also
verifies that all three skills, both deployment-local OpenAPI documents, authorization-server
metadata, and protected-resource metadata agree on the canonical installation URLs. It also
verifies both API versions and the retirement notice at both old instruction paths.

## Affected repositories

`hqbase`, `hqbase-site`
