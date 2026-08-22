---
title: Cloudflare access and security
description: How HQBase asks Cloudflare for temporary access during setup and updates.
---

HQBase in-product setup, domain changes, and signed updates use Cloudflare OAuth Authorization Code
with PKCE. Customers do not create, paste, or delete Cloudflare API tokens in HQBase product flows.

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

## Terminal operator command

The local `pnpm run hqbase -- domain` command is an operator tool, not a browser product flow. It
uses a short-lived `HQBASE_DOMAIN_API_TOKEN` with Workers Scripts:Edit and Zone:Read to inspect,
attach, and remove Worker custom domains. The token stays in the operator's terminal environment.
HQBase does not store or log it, send it to the customer Worker, or use it for Wrangler commands.
Wrangler uses its own authenticated login. The operator unsets the token after the command.

This exception does not add a manual token fallback to the setup wizard, in-app domain flow, or
signed update flow. Those product flows continue to use OAuth and fail closed when OAuth is not
available.

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
posts only the signed relay state. Continuation requires a same-origin form POST with the exact
`Origin`, valid signed and unexpired relay state, an allowed operation and callback, and a bounded
form body. Neither a cookie nor Fetch Metadata authorizes continuation by itself: along with those
requirements, HQBase accepts either a matching confirmation cookie or, when the cookie is
unavailable, same-origin user-activated Fetch Metadata navigation. A short-lived HTTP-only
host-bound cookie is defense in depth; suppressing it under browser privacy policy must not break a
deliberate confirmation click. Content-Length is optional and checked when present; the streamed
byte count enforces the limit. Invalid, expired, or incomplete handoffs render a bounded HQBase
error page instead of raw JSON.

The confirmation response uses `Referrer-Policy: strict-origin`, so its `Referer` header reveals
only the relay origin and not the authorization path, query, signed state, or PKCE challenge. The
continuation POST separately requires the exact relay `Origin` for CSRF validation. Its
`form-action` policy permits only the relay origin and Cloudflare&apos;s dashboard origin. Relay HTML is
`no-store, no-transform`: Cloudflare edge features must not inject analytics or any other script
into authorization and error pages.

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
