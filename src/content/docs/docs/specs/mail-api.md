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

HQBase supports OAuth dynamic client registration and the authorization-code flow with PKCE. A
public client registers with token endpoint authentication method `none`; it must not embed a
client secret. The authorization server's discovery document supplies the registration,
authorization, and token endpoints. Clients request the API resource when registering and
authorizing so the resulting token cannot be replayed against MCP or another service.

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
| `GET /messages` | `mail:read` | List or search messages, optionally filtered by mailbox or folder. |
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

## Requests and errors

JSON requests use `Content-Type: application/json`. Draft attachment uploads use
`multipart/form-data`. List endpoints use the documented query parameters in the OpenAPI document;
conversation cursors are opaque and clients must return them unchanged.

JSON errors have an `error` object with stable `code` and human-readable `message` fields. A missing
or invalid token returns `401`. A valid token without the required permission returns `403`.
Authentication errors include a `WWW-Authenticate` challenge containing the required scope and a
link to the protected-resource metadata. Every response includes `X-Request-Id`; API JSON responses
are not stored by shared caches.

Sending and replying are not idempotent. A client that repeats either request can send more than
once and must not retry it blindly. State and draft operations should still use the returned state
or draft version to avoid overwriting newer work.

HQBase does not currently provide a changes or delta feed. A client refreshes by listing messages
or conversations again and can use conversation cursors for bounded pagination.

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

## OpenAPI and human testing

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
audience and permission enforcement, live mailbox access, stable error challenges, and the web
app's use of the versioned routes.

## Affected repositories

`hqbase`, `hqbase-site`
