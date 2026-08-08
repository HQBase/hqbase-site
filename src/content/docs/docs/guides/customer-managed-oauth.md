---
title: Use your own Cloudflare OAuth client
description: Register a private Cloudflare OAuth client and connect it directly to your HQBase installation.
---

HQBase uses the verified public HQBase OAuth client by default. If your organization blocks public
OAuth applications, a Cloudflare administrator can register a private client in the same account
as the HQBase deployment. The private client redirects directly between Cloudflare and your
customer-owned Worker; the public HQBase OAuth relay is not used.

This mode still uses Authorization Code with PKCE. The client ID is public configuration. Do not
create or provide a client secret, and never paste a Cloudflare API token into HQBase.

## Register the client

In Cloudflare, create a private OAuth client with:

- grant type `authorization_code`;
- response type `code`;
- token endpoint authentication method `none`; and
- PKCE method `S256`.

Register these exact redirect URLs, replacing `https://mail.example.com` with the canonical HTTPS
origin that people use to open HQBase:

```text
https://mail.example.com/api/setup/cloudflare/oauth/callback
https://mail.example.com/api/domains/cloudflare/oauth/callback
https://mail.example.com/api/updates/cloudflare/oauth/callback
```

Allow this union of HQBase operation scopes:

```text
workers-scripts.write
workers-ci.write
zone.read
zone-settings.write
email-routing-rule.write
email-sending.write
```

HQBase requests only the subset needed for the current setup, domain, or update operation.

## Configure a new deployment

Run the installer with the private client ID and the installation's canonical HTTPS origin:

```sh
pnpm hqbase install \
  --name production \
  --app-domain mail.example.com \
  --auth-url https://mail.example.com \
  --oauth-mode customer \
  --oauth-client-id YOUR_CLIENT_ID
```

The deployment record saves the client ID, mode, and canonical origin as non-secret configuration.
The generated Wrangler configuration stores the same values in your Cloudflare account.

## Switch an existing deployment

Use the named deployment operator so the local deployment record, generated Wrangler
configuration, and deployed Worker stay aligned:

```sh
pnpm hqbase oauth \
  --name production \
  --mode customer \
  --auth-url https://mail.example.com \
  --client-id YOUR_CLIENT_ID
```

Validate the change without writing files or deploying:

```sh
pnpm hqbase oauth \
  --name production \
  --mode customer \
  --auth-url https://mail.example.com \
  --client-id YOUR_CLIENT_ID \
  --dry-run
```

Return to the verified public HQBase client with:

```sh
pnpm hqbase oauth --name production --mode official
```

HQBase derives every direct callback from the configured canonical origin, performs the token
exchange in the customer Worker, encrypts the temporary grant in an HTTP-only cookie, and revokes
it after the operation. OAuth callback URLs are excluded from invocation logs, and grants are never
stored in D1 or R2. See [Cloudflare access and security](/docs/specs/cloudflare-oauth/) for the full
security contract.
