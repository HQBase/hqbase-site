---
title: Mail API
description: Build clients and automations on HQBase's stable, versioned mail API.
---

HQBase exposes a stable HTTP API for mail clients, command-line tools, automations, and agents. The
HQBase web app uses the same API, so external clients follow the same mailbox access, validation,
threading, attachment, and sending rules as the product UI.

The current base path is `/api/v1`. It covers mailboxes, messages, conversations, attachments,
drafts, sending, and replying. It does not expose workspace administration, people, invitations,
domains, setup, updates, audits, sessions, notifications, app secrets, or Cloudflare credentials.

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
| `mail:write` | Trust a sender's remote media and mark mail read or unread, add or remove stars, archive mail, and move it to Trash. |
| `mail:send` | Manage drafts and draft attachments, send new mail, and reply. |
| `offline_access` | Ask the authorization server for an optional refresh token. It is not an API endpoint permission. |

Tokens are further limited by the connected person's current account and mailbox access. The most
limited result wins. Revoking consent, ending a session, banning a person, requiring password
setup, or changing mailbox access takes effect on the next request.

## Endpoints

All paths below are relative to `/api/v1`.

| Method and path | Permission | Purpose |
| --- | --- | --- |
| `GET /mailboxes` | `mail:read` | List mailboxes visible to the connected person. Owners and admins may see mailbox metadata for access management without receiving its mail. |
| `GET /messages` | `mail:read` | List or search messages with cursor pagination, optionally filtered by mailbox or folder. |
| `GET /changes` | `mail:read` | Read message upserts and deletion tombstones after a sync checkpoint. |
| `GET /messages/{id}` | `mail:read` | Get one message. |
| `GET /messages/{id}/thread` | `mail:read` | Get the accessible messages in the same thread. |
| `GET /messages/{id}/html` | `mail:read` | Get sanitized HTML rendering metadata for a message. |
| `GET /messages/{id}/inline/{attachmentId}` | `mail:read` | Render a safe inline image from a message. |
| `GET /attachments/{id}` | `mail:read` | Download an attachment. |
| `GET /conversations` | `mail:read` | List or search conversation summaries with cursor pagination. |
| `POST /messages/{id}/{action}` | `mail:write` | Apply `read`, `unread`, `star`, `unstar`, `archive`, or `trash`. |
| `POST /messages/{id}/remote-media/trust` | `mail:write` | Trust the message sender's remote images for the connected person. |
| `POST /conversations/{id}/{action}` | `mail:write` | Apply a message action to the accessible part of a conversation. |
| `GET /drafts` and `GET /drafts/{id}` | `mail:send` | List or get the connected person's drafts. |
| `POST /drafts` | `mail:send` | Create a draft. |
| `PATCH /drafts/{id}` | `mail:send` | Update a draft using its current version. |
| `DELETE /drafts/{id}` | `mail:send` | Delete a draft and its stored attachments. |
| `POST /drafts/{id}/attachments` | `mail:send` | Add one multipart file to a draft. |
| `DELETE /drafts/{draftId}/attachments/{id}` | `mail:send` | Remove a draft attachment. |
| `POST /send` | `mail:send` | Send a new message. |
| `POST /reply` | `mail:send` | Reply to an existing message. |

Mailbox access still applies after OAuth permission checks. Read access is required to receive mail
content, Agent access is required for organization and sending actions, and Manager access is not
granted by this API. Owners retain Manager access to every mailbox. An admin without mailbox access
can see mailbox metadata but cannot read, change, or send its mail.

Inbound mail that did not match a mailbox is unassigned and has no mailbox grant. Only an owner can
list, read, change, or download this mail through the REST API or MCP. The stored unassigned state
stays authoritative after an owner archives or trashes the message. A null mailbox reference by
itself does not grant catch-all access, and a missing message still returns `404`.

The changes feed applies the same live rule. An unassigned deletion tombstone has a null
`mailboxId`; only owners receive it.

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

## Requests and errors

JSON requests use `Content-Type: application/json`. Draft attachment uploads use
`multipart/form-data`. List endpoints use the documented query parameters in the OpenAPI document;
message and conversation cursors are opaque and clients must return them unchanged.

JSON errors have an `error` object with stable `code` and human-readable `message` fields. A missing
or invalid token returns `401`. A valid token without the required permission returns `403`.
Authentication errors include a `WWW-Authenticate` challenge containing the required scope and a
link to the protected-resource metadata. Every response includes `X-Request-Id`; API JSON responses
are not stored by shared caches.

Sending and replying are not idempotent. A client that repeats either request can send more than
once and must not retry it blindly. State and draft operations should still use the returned state
or draft version to avoid overwriting newer work.

Clients use the changes feed for normal message synchronization. They still use full message and
conversation listings for bootstrap, access changes, and recovery after an expired cursor.

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
