---
title: Cloudflare access and security
description: How HQBase asks Cloudflare for temporary access during setup and updates.
---

HQBase setup, domain changes, and signed updates use Cloudflare OAuth Authorization Code with PKCE.
Customers do not create, paste, or delete Cloudflare API tokens in HQBase product flows.

## Supported clients

The default product uses the verified public HQBase OAuth client through
`hqbase-cloudflare-auth`. Organizations that block public OAuth applications and operators of
forks may instead register a customer-managed Cloudflare OAuth client in the same Cloudflare
account as the HQBase deployment.

See [Use your own Cloudflare OAuth client](/docs/guides/customer-managed-oauth/) for the exact
registration and deployment steps.

Both modes use Authorization Code with PKCE and token endpoint authentication method `none`.
Customer-managed clients register the exact setup, domain, and update callback URLs for their
canonical HTTPS HQBase origin. Customer-managed configuration contains a non-secret client ID and
canonical origin only. HQBase never asks for an OAuth client secret or Cloudflare API token.

## Official relay

`hqbase-cloudflare-auth` is the public AGPL redirect relay operated at `auth.hqbase.io`. It owns
the fixed verified HQBase OAuth client identity, selects fixed operation scopes, and validates
signed, expiring redirect state. The relay receives the short-lived authorization code on the
registered callback and forwards it to the originating customer Worker. It never exchanges the
code, receives an access or refresh token, or calls customer APIs.

The customer-owned Worker generates the PKCE verifier and exchanges the returned code directly
with Cloudflare. Runtime grants stay in short-lived encrypted HTTP-only cookies. HQBase may carry
an installation grant as a masked Worker secret through initial setup. HQBase revokes the grant and
removes temporary credentials after the authorized operation completes. No refresh token is stored.

The relay presents an HQBase-owned confirmation screen before redirecting to Cloudflare. The form
posts only the signed relay state. Continuation always requires a same-origin form POST, the exact
`Origin`, valid signed and unexpired relay state, an allowed operation and callback, and a bounded
form body. A short-lived HTTP-only host-bound cookie is defense in depth: when the browser returns
one it must match the confirmation nonce, but suppressing that cookie under browser privacy policy
must not break a deliberate confirmation click. The cookie-less path additionally requires Fetch
Metadata for a same-origin, user-activated document navigation. Neither a cookie nor request
metadata alone authorizes continuation. Request bodies are capped by their actual streamed byte
count; `Content-Length` is optional transport metadata and is never required for a valid browser
submission. Invalid, expired, or incomplete browser handoffs render a bounded HQBase error screen
with a safe return action instead of raw JSON.

The confirmation response preserves an origin-only referrer policy so a same-origin browser form
submission carries its origin for CSRF validation without forwarding the authorization URL, query,
signed state, or PKCE challenge. Its form policy permits only the relay origin and Cloudflare's
dashboard origin so browsers that apply `form-action` across the redirect chain can complete the
server-controlled redirect to Cloudflare. Relay HTML is `no-store, no-transform`: Cloudflare edge
features must not inject analytics or any other script into authorization and error pages.

## Permissions and recovery

Each flow requests only the account, Worker, storage, queue, domain, Email Routing, and Email
Sending permissions required by that operation. Cloudflare scopes the grant to accounts and zones
selected by the customer. Operators cannot add scopes through product UI or runtime input.

HQBase does not expose a manual API-token fallback. If an organization blocks the public OAuth
client, the affected flow stops with a specific administrator-facing recovery message that links
to customer-managed OAuth client setup. Invalid or incomplete customer-managed configuration fails
closed before Cloudflare authorization begins.

## Security properties

- PKCE verifiers and grants stay in encrypted HTTP-only cookies or temporary masked secrets and
  never enter browser-visible application state.
- Authenticated infrastructure changes require a session created within the recent-authentication
  window. An older session is reauthenticated with the current user's HQBase password inside the
  originating authorization modal, rate-limited, audited, and resumed without exposing the OAuth
  start endpoint as a browser page.
- Official relay state binds the operation, PKCE challenge, exact HTTPS callback, destination
  display, and expiry. The relay does not provide an unlabelled redirect to a caller-controlled
  origin.
- Customer-managed callbacks use the configured canonical HTTPS origin rather than a request Host
  header.
- Relay state is authenticated, expires after ten minutes, and cannot become an open redirect.
- OAuth callback routes disable automatic invocation URL logs. Authorization codes and tokens
  never enter application logs, D1, R2, or browser-visible markup.
- Relay release acceptance submits the real confirmation form with its cookie and without assuming
  a browser-visible `Content-Length`, and separately submits the privacy-safe, cookie-less
  same-origin user-activated navigation shape. Both verify the redirect reaches Cloudflare with the
  fixed client, callback, scopes, signed state, and PKCE challenge. Browser acceptance also verifies
  the confirmation page's content policy permits that redirect and that the delivered HTML contains
  no edge-injected script.

## Affected repositories

`hqbase-cloudflare-auth`, `hqbase`, `hqbase-site`
