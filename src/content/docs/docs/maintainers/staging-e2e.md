---
title: Checking a deployed change
description: Run staging checks without using production data or credentials.
---

:::caution[Authorized maintainers only]
Requires access to HQBase's protected staging environment. [Contributors use their own
infrastructure](/docs/maintainers/contributing/).
:::

Staging proves that HQBase works after it is deployed to real Cloudflare resources. A local browser
or Worker test is useful, but it is not a staging result.

The test code lives in `hqbase/test/e2e/staging`. GitHub runs it through
`hqbase/.github/workflows/staging-e2e.yml`.

## What staging proves

Each run checks:

- the public health response, web-app manifest, service worker, offline shell, and rendered app;
- creation of the first owner and browser sign-in;
- mailbox access for different users;
- operator diagnostics; and
- backup and restore with a populated D1 database.

The signed-release workflow adds one critical update test: it uses the oldest supported bootstrap
to install the previous stable release, creates data, recreates the legacy configuration gap, and
updates to the exact candidate. It proves that the candidate restores `MAIL_EVENTS` and the
authenticated event WebSocket while the old bootstrap still omits the post-deploy database phase.
It then completes the detected same-release repair through the canonical updater and proves that
both migration ledgers and the final schema are healthy. The GitHub Release stays in draft until
this passes.

Each signed-release run uses a new Worker name and new D1, R2, and Queue names. A failed first
Worker deployment therefore cannot leave state that changes a later release test. The protected
staging hostname remains stable and points to the Worker for the active run. Cleanup removes the
exact recorded run resources, including an empty Worker service left by a failed first deployment.

Retries, permanently failed queue jobs, unused-object cleanup, log redaction, and failure branches
are covered by lower-level integration tests. Staging should not claim to prove behavior it does not
exercise.

Receiving public email through Cloudflare Email Routing is a separate candidate check until it has
dedicated automation.

## Keep staging isolated

Use the HQBase staging Cloudflare account with:

- app and email hostnames used only for staging;
- the stable `hqbase-e2e-staging` Worker name for manual staging;
- run-specific Worker, D1, R2, and Queue names for signed-release staging;
- a separate Cloudflare API token with only the permissions staging needs;
- secrets stored in the GitHub `hqbase-staging` Environment; and
- Cloudflare Access in front of the staging app.

Never use production email domains, data, or credentials. Wait for hostname changes by checking
whether they are ready; do not guess with a fixed sleep.

## GitHub secrets and variables

The `hqbase-staging` Environment needs these secrets:

- `HQBASE_E2E_CLOUDFLARE_ACCOUNT_ID`
- `HQBASE_E2E_CLOUDFLARE_API_TOKEN`
- `HQBASE_E2E_ACCESS_CLIENT_ID`
- `HQBASE_E2E_ACCESS_CLIENT_SECRET`
- `HQBASE_E2E_APP_HOSTNAME`
- `HQBASE_E2E_EMAIL_DOMAIN`
- `HQBASE_E2E_OWNER_EMAIL` - a login on a different domain from
  `HQBASE_E2E_EMAIL_DOMAIN`, so it remains usable when the staging workspace is unavailable.
- `HQBASE_E2E_OWNER_PASSWORD`

It also needs this Environment variable:

- `HQBASE_E2E_OAUTH_CLIENT_ID` - a private PKCE client in the staging Cloudflare account with setup, domain,
  and update callback URLs for the stable staging hostname.

## Run a reviewed candidate

Always run the workflow definition from `main`, then pass the commit or ref you reviewed:

```sh
gh workflow run staging-e2e.yml --repo HQBase/hqbase --ref main -f candidate_ref=<commit>
```

Do not expose staging secrets to pull-request workflows or weaken the GitHub Environment's branch
policy.

## After the run

Each run uploads only its non-secret deployment record, then removes its temporary Cloudflare
resources. If cleanup fails, use that record to identify the exact resources; never delete by a
broad name pattern. Resource creation can briefly precede control-plane visibility. Staging must
retry exact identity reads without repeating a create request, and it must keep ambiguous ownership
fail-closed if the bounded verification period expires.
