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
It then signs in to the deployed candidate, puts a separate user-scoped staging API token in the
encrypted grant cookie, and calls `POST /api/updates/apply`. A real run-owned Workers Builds trigger
must accept the short deploy command, exact `HQBASE_UPDATER_LOADER` value, reviewed-version pin, and
manual build request. Cloudflare must return a real build identifier. Staging links that build to
the exact trigger, cancels it before deployment, and verifies that the probe did not change the
active Worker or D1. The build cannot complete before publication because the signed candidate
assets are still in a draft GitHub Release. The existing direct signed bootstrap then completes the
same-release repair and proves that both migration ledgers and the final schema are healthy. The
accepted-and-cancelled product-route probe and the direct repair are separate required proofs. The
GitHub Release stays in draft until both pass. The WebSocket probe sends both the Cloudflare Access
service-token headers and the authenticated HQBase session cookie on its upgrade request. A browser
WebSocket does not add the service-token headers from Playwright's normal HTTP settings.

Each signed-release run uses new app and manifest Worker names and new D1, R2, and Queue names. A
failed first app-Worker deployment therefore cannot leave state that changes a later release test.
The protected staging hostname remains stable and points to the app Worker for the active run.
Cleanup removes the exact recorded run resources. Before cleanup, it reconciles an active run
Worker into the manifest so the Worker is deleted before its bound Queues. It directly deletes a
Worker service only when Cloudflare reports that the exact run Worker has no deployments. An unknown
state fails closed.

Retries, permanently failed queue jobs, unused-object cleanup, log redaction, and failure branches
are covered by lower-level integration tests. Staging should not claim to prove behavior it does not
exercise.

Receiving public email through Cloudflare Email Routing is a separate candidate check until it has
dedicated automation.

## Keep staging isolated

Use the HQBase staging Cloudflare account with:

- app and email hostnames used only for staging;
- the stable `hqbase-e2e-staging` Worker name for manual staging;
- run-specific app Worker, manifest Worker, D1, R2, and Queue names for signed-release staging;
- a separate Cloudflare API token with only the permissions staging needs;
- secrets stored in the GitHub `hqbase-staging` Environment; and
- Cloudflare Access in front of the staging app.

Never use production email domains, data, or credentials. Wait for hostname changes by checking
whether they are ready; do not guess with a fixed sleep. Workflows that use the same staging
hostname must share one concurrency group so they cannot move the hostname at the same time.

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

It also needs these Environment variables:

- `HQBASE_E2E_OAUTH_CLIENT_ID` - a private PKCE client in the staging Cloudflare account with setup, domain,
  and update callback URLs for the stable staging hostname.
- `HQBASE_E2E_REPO_CONNECTION_UUID` - the reused staging-only Cloudflare repository connection for
  `HQBase/hqbase`.
- `HQBASE_E2E_BUILD_TOKEN_UUID` - the reused staging-only Workers Builds token reference.

The Environment also needs `HQBASE_E2E_UPDATE_API_TOKEN` as a separate secret. It is a user-scoped
API token used only in the encrypted grant cookie for the deployed update-action probe. It must have
Zone Read, Workers Scripts Read, and Workers Builds Configuration Edit for the staging account. Do
not reuse the cleanup token because the product route attempts OAuth revocation after success or
failure. This injected API token does not prove a real OAuth exchange or successful OAuth-token
revocation. Unit tests cover those paths. Staging must verify that the product route removes the
grant cookie even when revocation fails.

Before the probe, the workflow exposes only the signed candidate manifest from a run-owned
temporary Worker at an unguessable path. It sets the candidate app's
`HQBASE_RELEASE_MANIFEST_URL` to that exact URL. The candidate archive remains in the private draft
release. The workflow records the temporary Worker before creation and deletes only that exact
Worker after the probe.

Before trigger creation, the workflow records the app Worker tag, deterministic trigger name,
repository connection, build token, branch, root, and command values. After Cloudflare accepts the
create request, it records the returned trigger UUID. An ambiguous create result can adopt one
trigger only if every recorded field matches. Zero matches means that no trigger was created. More
than one match stops cleanup for operator review.

Before build dispatch, the workflow records the exact trigger and dispatch time. After Cloudflare
accepts the request, it records the returned build UUID. An ambiguous dispatch is reconciled only by
an exact trigger UUID, API source, branch, commit, and bounded creation time. If the result is not
unique, cleanup stops for operator review. Cleanup cancels only the recorded or exactly reconciled
build, waits for a terminal state, deletes the exact trigger UUID and temporary manifest Worker, and
verifies that both are absent. It never deletes the reused repository connection or build token.

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
