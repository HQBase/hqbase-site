---
title: Mail API
description: Build clients and automations on HQBase's stable, versioned mail API.
---

HQBase exposes a stable HTTP API for mail clients, command-line tools, automations, and agents. The
HQBase web app uses the same API, so external clients follow the same mailbox access, validation,
threading, attachment, and sending rules as the product UI.

The current base path is `/api/v1`. It covers mailboxes, messages, conversations, attachments,
drafts, sending, replying, and forwarding. It does not expose workspace administration, people,
invitations, domains, setup, updates, audits, sessions, notifications, app secrets, or Cloudflare
credentials.

## Authentication

HQBase accepts two forms of authentication on `/api/v1`:

- The web app uses its HTTP-only HQBase session cookie.
- External clients use an OAuth bearer token issued by the same HQBase installation.

OAuth clients discover the installation's authorization server at
`/.well-known/oauth-authorization-server/api/auth` and this API's protected-resource metadata at
`/.well-known/oauth-protected-resource/api/v1`. The protected resource and token audience are the
installation origin followed by `/api/v1`, for example `https://mail.example.com/api/v1`.
Protected-resource metadata identifies the API as **HQBase Mail API** and links its
`resource_documentation` to the installation's generated Agent Skill at
`/skills/hqbase-mail/SKILL.md`.

HQBase supports OAuth dynamic client registration, Device Authorization Grant, and Authorization
Code with PKCE. Device Authorization is the preferred flow for agents, command-line tools, and
other clients that cannot safely receive a browser callback. PKCE remains available for clients
that can receive one.

A public client registers with token endpoint authentication method `none`; it must not embed a
client secret. The authorization server's discovery document supplies the registration,
authorization, device-authorization, and token endpoints. Clients request the API resource when
registering and authorizing so the resulting token cannot be replayed against MCP or another
service.

### Device Authorization Grant

The client registers `urn:ietf:params:oauth:grant-type:device_code`, requests a device code from
`/api/auth/device/code`, shows the returned short `user_code` and `verification_uri` to the person,
and polls `/api/auth/oauth2/token` at no less than the returned `interval`. An agent presents the
verification URL as a clickable link but does not open it in Cloud Browser or another remote,
automated, or agent-controlled browser. The person opens the verification URL in a browser they
control, signs in to HQBase if necessary, verifies that the displayed code, client, permissions,
and Mail API resource match the request, and chooses **Allow** or **Deny**. The client does not
receive HQBase credentials, browser cookies, or a callback URL.

The authorization request and token exchange both include the installation's `/api/v1` resource.
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
| `offline_access` | Ask the authorization server for an optional refresh token. It is not an API endpoint permission. |

Tokens are further limited by the connected person's current account and mailbox access. The most
limited result wins. Revoking consent, ending a session, banning a person, requiring password
setup, or changing mailbox access takes effect on the next request.

HQBase rotates refresh tokens. A second matching refresh request that uses the previous token
within 30 seconds returns the same rotated token response. Reuse after that window remains a replay
and invalidates the refresh-token family.

## Endpoints

All paths below are relative to `/api/v1`.

| Method and path | Permission | Purpose |
| --- | --- | --- |
| `GET /mailboxes` | `mail:read` | List mailboxes visible to the connected person. Owners and admins may see mailbox metadata for access management without receiving its mail. |
| `GET /messages` | `mail:read` | List or search messages with cursor pagination, optionally filtered by mailbox or folder. |
| `GET /changes` | `mail:read` | Read message upserts and deletion tombstones after a sync checkpoint. |
| `GET /events` | `mail:read` | Open a WebSocket that wakes clients when a synchronization feed can have new work. |
| `GET /messages/{id}` | `mail:read` | Get one message. |
| `GET /messages/{id}/thread` | `mail:read` | Get the accessible messages in the same thread. |
| `GET /messages/{id}/html` | `mail:read` | Get sanitized HTML rendering metadata, including visible content before and after any separately returned quoted reply history. |
| `GET /messages/{id}/inline/{attachmentId}` | `mail:read` | Render a safe inline image from a message. |
| `GET /attachments/{id}` | `mail:read` | Download an attachment. |
| `GET /conversations` | `mail:read` | List or search conversation summaries with cursor pagination. |
| `POST /messages/{id}/{action}` | `mail:write` | Apply `read`, `unread`, `star`, `unstar`, `archive`, `unarchive`, `trash`, or `restore`. |
| `POST /messages/{id}/remote-media/trust` | `mail:write` | Trust the message sender's remote images for the connected person. |
| `POST /conversations/{id}/{action}` | `mail:write` | Apply a message action to the accessible part of a conversation. |
| `GET /drafts` and `GET /drafts/{id}` | `mail:send` | List one cursor page or get one of the connected person's drafts. |
| `GET /drafts/changes` | `mail:send` | Read draft upserts and deletion tombstones after a sync checkpoint. |
| `POST /drafts` | `mail:send` | Create a draft. |
| `PATCH /drafts/{id}` | `mail:send` | Update a draft using its current version. |
| `DELETE /drafts/{id}` | `mail:send` | Delete a draft and its stored attachments. |
| `POST /drafts/{id}/attachments` | `mail:send` | Add one multipart file to a draft. |
| `DELETE /drafts/{draftId}/attachments/{id}` | `mail:send` | Remove a draft attachment. |
| `POST /send` | `mail:send` | Send a new message. |
| `POST /reply` | `mail:send` | Reply to an existing message. |
| `POST /forward` | `mail:send` | Forward an existing message with optional staged and original attachments. |

Mailbox access still applies after OAuth permission checks. Read access is required to receive mail
content, Agent access is required for organization and sending actions, and Manager access is not
granted by this API. Owners retain Manager access to every mailbox. An admin without mailbox access
can see mailbox metadata but cannot read, change, or send its mail.

Inbound mail that did not match a mailbox is unassigned and has no mailbox grant. Only an owner can
list, read, change, or download this mail through the REST API or MCP. The stored unassigned state
stays authoritative after an owner archives, unarchives, trashes, or restores the message. A null
mailbox reference by itself does not grant catch-all access, and a missing message still returns
`404`.

The changes feed applies the same live rule. An unassigned deletion tombstone has a null
`mailboxId`; only owners receive it.

### Message search

The `search` value is one literal substring. HQBase searches the subject, sender address, To
recipients, snippet, and plain-text body. The characters `%`, `_`, and `\` are ordinary search
text. They do not enable wildcards or escapes. Mailbox access and the requested mailbox and folder
filters still apply, and search does not change the activity-time order used by pagination.

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

### Draft attachments

`POST /drafts/{id}/attachments` accepts one `file` part. HQBase records the part's `Content-Type`.
If the part has no type, HQBase records `application/octet-stream`. A file can be at most 25 MiB,
and all attachments in one draft can total at most 25 MiB. An upload that exceeds either limit
returns `413 ATTACHMENTS_TOO_LARGE`. Send, reply, and forward requests can name at most 20 staged
attachments.

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

Creating or editing a draft, adding or removing an attachment, sending a saved draft, and deleting
a draft all write to the draft journal. The monotonic sequence keeps rapid changes distinct and
keeps deletion records after the draft row is removed. HQBase applies the connected person's
current ownership and mailbox access before it returns an upsert. When mailbox access changes, a
client repeats the full draft bootstrap so drafts that became hidden or visible are reconciled.

A new client uses this bootstrap order:

1. Request a draft-changes checkpoint without a cursor and keep its `nextCursor`.
2. Paginate the full draft list.
3. Request draft changes after the checkpoint until `hasMore` is `false`.

HQBase keeps draft-journal rows in this API version. Future bounded retention must return `410`
with `DRAFT_CHANGE_CURSOR_EXPIRED` instead of silently skipping changes. Invalid list cursors
return `400 INVALID_DRAFT_CURSOR`. Invalid change cursors return
`400 INVALID_DRAFT_CHANGE_CURSOR`. An invalid limit returns `400 INVALID_LIMIT`.

Drafts are not message rows. HQBase keeps `drafts` in the v1 message-folder enum for compatibility,
but current write paths do not store messages in that folder. Clients use `/drafts` and
`/drafts/changes` for a Drafts folder. The conversation-folder enum omits `drafts` because drafts
are private composer state, not conversations.

### Message pagination

`GET /messages` returns one page of messages as a JSON array. `limit` sets the page size. It is an
integer from 1 to 100 and defaults to 100. Messages are ordered by activity time, newest first,
where activity time is the received time, then the sent time, then the creation time. Messages with
the same activity time are ordered by descending identifier, so the order stays stable across a page
boundary.

When more messages follow the page, the response includes an RFC 8288 `Link` header of the form
`<url>; rel="next"`. The URL keeps the `mailboxId`, `folder`, `search`, and `limit` values of the
request and adds a `cursor`. A client follows that URL to read the next page. The last page has no
`Link` header.

A cursor is opaque and versioned. Clients must return it unchanged and must not construct, parse, or
edit one. A cursor from another list, such as a conversation cursor, is not valid here. A cursor
never widens message access: every page is filtered by the mailboxes the connected person can read
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

HQBase applies the connected person's current mailbox access to each journal entry. Before each
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

`GET /api/v1/events` upgrades an authenticated HTTP request to a WebSocket. It is a wake-up channel,
not a second data API. A bearer token needs `mail:read`. The web app can use its same-origin HQBase
session cookie. A cookie-authenticated upgrade must include an `Origin` header that exactly matches
the HQBase installation origin. A missing or different origin returns `403 ORIGIN_FORBIDDEN`.
Bearer-token connections do not depend on the `Origin` header and can omit it.

The server sends JSON text frames in this form:

```json
{ "type": "changed", "topic": "messages" }
```

The topic is one of:

- `messages` — read `/changes` from the client's last message cursor until `hasMore` is `false`.
- `drafts` — read `/drafts/changes` from the client's last draft cursor until `hasMore` is `false`.
- `mailboxes` — list `/mailboxes` again and apply the documented access-change bootstrap rules.

The server sends only topics permitted by the connection. A bearer connection always needs
`mail:read`; it receives the `drafts` topic only when its token also has `mail:send`. A session
connection can receive all three topics. Events contain no mail content, identifiers, counts,
cursor values, or mailbox names.

The authorization decision at upgrade is an event-delivery lease for 10 minutes. Revoking a bearer
token or consent, ending its session, or ending a web session does not close the existing socket
immediately. The server closes the socket when the lease ends. Reconnection must use current
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

A connected client can send the exact text frame `ping`; the server replies with the exact text
frame `pong`. Clients can use this application heartbeat to detect a connection that stopped
delivering data. The heartbeat carries no mail or authentication data. A client closes and
reconnects a socket that does not answer within its heartbeat deadline.

The web app polls only while its event socket is unavailable. A successful fallback refresh keeps
the app usable while it reconnects. A failed fallback refresh means that neither live events nor
the HTTP API is available. Opening a socket stops fallback polling and drains the synchronization
feeds again. A connected socket can miss a wake-up if notification delivery fails. Another event
can recover the change sooner. The lease expires no later than 10 minutes after upgrade and forces
a reconnect; the next successful connection drains all feeds. The green connection indicator
reports WebSocket transport health; it does not prove that every wake-up arrived.

HQBase routes authenticated connections through a hibernating Durable Object. Successful message,
draft, mailbox, and mailbox-access mutations notify it after the durable database write.
Notification failure never rolls back accepted mail or a completed mutation because the journals
remain the recovery path. The Durable Object does not poll D1 and does not use timers to keep
connections open. It answers the application heartbeat through the runtime's hibernating
WebSocket auto-response.

## Requests and errors

JSON requests use `Content-Type: application/json`. Draft attachment uploads use
`multipart/form-data`. List endpoints use the documented query parameters in the OpenAPI document;
message and conversation cursors are opaque and clients must return them unchanged.

JSON errors have an `error` object with stable `code` and human-readable `message` fields. A missing
or invalid token returns `401`. A valid token without the required permission returns `403`.
Authentication errors include a `WWW-Authenticate` challenge containing the required scope and a
link to the protected-resource metadata. Every response includes `X-Request-Id`; API JSON responses
are not stored by shared caches.

Sending, replying, and forwarding are not idempotent. A client that repeats any of these requests
can send more than once and must not retry it blindly. State and draft operations should still use
the returned state or draft version to avoid overwriting newer work.

Clients use the changes feed for normal message synchronization and the event WebSocket only to
wake that process sooner. They still use full message and conversation listings for bootstrap,
access changes, and recovery after an expired cursor.

## Stability policy

`/api/v1` is the stable public mail API. Within v1, HQBase may add endpoints, optional request
fields, response fields, and error codes. Clients must ignore response fields they do not
understand. HQBase will not remove or rename an endpoint or field, make an optional request field
required, change the meaning of existing data, or broaden an existing enum in a way that changes
client behavior without introducing a new API version.

Security fixes can make previously accepted unauthorized or invalid requests fail. Operational
limits can also be tightened to protect an installation, with a documented error response.

When a breaking version is necessary, it receives a new base path such as `/api/v2`. HQBase will
document the migration and deprecation window before removing a supported public version. The
unversioned `/api/*` routes are product-internal compatibility routes and are not covered by this
stability promise.

## Agent Skill, OpenAPI, and human testing

Every HQBase installation publishes a generated, instruction-only Agent Skill at
`/skills/hqbase-mail/SKILL.md`. The file starts with the required `name` and `description` YAML
frontmatter. Its body contains the installation's canonical origin, OAuth discovery and audience
URLs, permission rules, safety requirements, and a compact method index generated from the OpenAPI
contract. The method index is for orientation; the OpenAPI document remains authoritative for
parameters, payloads, schemas, content types, and errors.

`/AGENTS.md` and `/agents.md` permanently redirect to the canonical Agent Skill URL for
compatibility with the earlier generated guide.

The same installation serves its instance-adjusted OpenAPI document at
`/api/v1/openapi.json`. Its `servers` entry and external documentation link use the installation's
canonical origin. Both discovery documents are public, contain no account data or credentials, and
support `GET` and `HEAD`.

The canonical machine-readable contract is the
[OpenAPI 3.1 document](https://github.com/HQBase/hqbase/blob/main/api/hqbase-mail-api-v1.openapi.json).
The repository also publishes a generated
[Postman collection](https://github.com/HQBase/hqbase/blob/main/api/hqbase-mail-api-v1.postman_collection.json)
and an importable
[Postman environment template](https://github.com/HQBase/hqbase/blob/main/api/hqbase-mail-api-v1.postman_environment.json).

Set the environment's `base_url` to the canonical origin of your installation. Use the collection's
OAuth setup requests to inspect discovery and dynamically register a public client, then complete
Authorization Code with PKCE in Postman and keep the access token in a local, unsynced environment.
Do not publish tokens, API responses, or mail content in a shared collection or workspace.

The checked-in collection and environment are generated from the OpenAPI contract. HQBase's test
suite rejects artifact drift and verifies cookie authentication, bearer authentication, OAuth
audience and permission enforcement, Device Authorization polling and approval boundaries, live
mailbox access, stable error challenges, and the web app's use of the versioned routes. It also
verifies that the Agent Skill, deployment-local OpenAPI document, authorization-server metadata,
and protected-resource metadata agree on the canonical installation URLs and that the Agent Skill
lists every public Mail API operation. It also verifies both compatibility redirects.

## Affected repositories

`hqbase`, `hqbase-site`
