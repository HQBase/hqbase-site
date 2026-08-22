---
title: Making a product change
description: Find the owner, write reviewable code, protect customer data, and prove the change works.
---

Start by finding which repository owns the behavior. A change is not finished until every affected
repository, test, and public page agrees.

## Find the owner

| Repository | What it owns |
| --- | --- |
| `hqbase-site` | The public product page and documentation experience. |
| `hqbase` | The installed app, setup, mail behavior, Cloudflare handoff, recovery, and updates. |
| `hqbase-cloudflare-auth` | Only the public, stateless Cloudflare OAuth redirect relay. |

Cloudflare owns its own repository-cloning, resource-selection, consent, and security screens.
HQBase explains when one of those screens is coming, but never pretends to control the screen
itself.

Installation and first-time setup can affect all three HQBase repositories. Adding people to an
existing workspace belongs to `hqbase` only.

## Write code people can review

- Organize code around a feature and a clear responsibility.
- Keep business rules independent from React, HTTP transport, and Cloudflare bindings when
  practical.
- Make dependencies explicit. Avoid circular imports and reaching through one feature to use
  another feature&apos;s internals.
- Prefer small, typed, direct code over a generic framework built for imagined future needs.
- File-size guidance lives in the architecture check configuration; treat a limit as a prompt to
  look for a cleaner split, not as a target to fill.

## Protect customer data and credentials

- Validate every value that enters through a browser, API, email, queue, or third-party service.
- Set clear size limits and return structured errors.
- Never log secrets, credentials, raw email, subjects, addresses, or attachments.
- Use Web Crypto for security-sensitive randomness and verification in Workers.
- Await every Promise, or deliberately hand it to the Cloudflare request lifecycle.
- Never keep request-specific mutable data in a global variable.

The OAuth relay confirmation page must name the exact customer workspace before redirecting away
from HQBase. Success and failure pages must work on desktop and mobile, reveal no sensitive request
details, and send the person back to their workspace to restart authorization after a failure.

## Change the database safely

- Put every schema change in a numbered SQL migration and review the SQL before you commit it.
- Apply migrations only with the HQBase Wrangler commands. Wrangler owns the `d1_migrations`
  ledger used by installation, update, staging, and recovery workflows.
- Keep the Drizzle table definitions under `worker/db/` aligned with the resulting database schema.
  Drizzle provides runtime types and queries; it does not generate or apply HQBase migrations.
- Do not rename or edit an applied migration. Existing installations must keep the same migration
  history.
- State and test the data invariants for each backfill.
- Test the migration against an empty database and a populated database.
- Test retry and failure behavior when they apply.
- Before a destructive migration, write down the cutover and rollback plan.

A migration must be safe if a deployment stops halfway through. Inspect `d1_migrations`; never add
or remove its rows by hand. If the migration is recorded, repair it with a new forward migration or
use the documented restore procedure. If it is not recorded, retry it only after a test proves the
entire SQL migration safe to rerun, including schema statements and backfills with their data
invariants. Otherwise restore the D1 checkpoint before retrying.

Every schema change lands with fresh-install and update tests. See
[For maintainers](/docs/maintainers/) for where those checks run.

## Test the behavior you changed

Add the smallest useful test for every business rule, access boundary, API validation path,
migration, and fixed bug.

- **Unit tests** cover rules that do not need Cloudflare or network services.
- **Worker integration tests** run in `workerd` with controlled bindings.
- **Protocol tests** use real local sockets when the protocol matters, but do not claim that a
  local test proves a deployed environment.
- **End-to-end tests** mean tests against deployed staging.

Coverage inventories rot; principles do not. A change to MCP covers both connection profiles and
every access boundary it touches. A change to notifications or setup covers permission, ownership,
access changes, failure paths, and unsupported devices. Derive the concrete list from the change,
not from this page.

Tests that use credentials must disable request tracing and video. Do not upload HTML reports or
other artifacts that might retain request headers, bodies, cookies, or secrets.

Keep tests beside the feature structure they cover. Measure coverage to catch regressions and raise
the minimum over time; do not add empty tests merely to improve a percentage.

## Check the interface as a person would use it

Cover success, loading, invalid, error, and completed states. Then check the behavior in a browser,
not only in source code, on desktop and mobile widths, in both themes.

Use message fixtures to check sanitization, embedded content-ID images, remote-image choices, and
attachments that belong to one specific message. For installable-app changes, verify the manifest,
service-worker lifecycle, offline fallback, update prompts, and notification navigation by hand.

Notification changes must cover permission, ownership, multiple devices, current mailbox access,
and delivery-failure isolation. Setup changes must cover Cloudflare authorization boundaries,
deployment triggers, and redirects.

## Before you call it done

- Run the repository&apos;s full local check. CI and local development use the same primary commands.
- TypeScript repositories must pass formatting, linting, strict type checking, tests, coverage,
  architecture checks, build, and deployment dry-run.
- If several repositories own the behavior, all of them must pass before the change is complete.
- Run deployed staging for behavior that crosses systems.

Release and staging credentials belong in separate protected GitHub Environments. A local
production deployment is for recovery only and must record its source commit. The site and OAuth
relay deploy from successful `main` CI; the app itself publishes only through the signed-release
workflow described in [Publishing a release](/docs/maintainers/releases/).

Next: [Check a deployed change](/docs/maintainers/staging-e2e/) or
[publish a release](/docs/maintainers/releases/).
