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
HQBase should explain when one of those screens is coming, but should not pretend it controls the
screen itself.

Installation and first-time setup can affect all three HQBase repositories. Adding people to an
existing workspace belongs to `hqbase` only.

## Write code people can review

- Organize code around a feature and a clear responsibility.
- Keep business rules independent from React, HTTP transport, and Cloudflare bindings when
  practical.
- Make dependencies explicit. Avoid circular imports and reaching through one feature to use
  another feature's internals.
- Prefer small, typed, direct code over a generic framework built for imagined future needs.
- Treat 250-300 lines as a reason to look for a cleaner split. Implementation files should normally
  stay below 400 lines; a narrow exception needs an allowlist entry and an explanation.

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

## Test the behavior you changed

Add the smallest useful test for every business rule, access boundary, API validation path,
migration, and fixed bug.

- **Unit tests** cover rules that do not need Cloudflare or network services.
- **Worker integration tests** run in `workerd` with controlled bindings.
- **Protocol tests** use real local sockets when the protocol matters, but do not claim that a
  local test proves a deployed environment.
- **End-to-end tests** mean tests against deployed staging.

MCP changes must cover both connection profiles, OAuth defaults and challenges, token audiences,
permissions, tool registration, mailbox access, draft versions, attachment transfer,
conversations, threads, and representative sending actions.

Tests that use credentials must disable request tracing and video. Do not upload HTML reports or
other artifacts that might retain request headers, bodies, cookies, or secrets.

Keep tests beside the feature structure they cover. Measure coverage to catch regressions and raise
the minimum over time; do not add empty tests merely to improve a percentage.

## Check the interface as a person would use it

Cover success, loading, invalid, error, and completed states. Then check the behavior in a browser,
not only in source code.

For desktop and mobile, verify:

- Light and Dark mode persistence;
- message presentation, wide-message scrolling, and embedded-content sizing;
- drawer focus, Compose state, tables, dialogs, and setup screens; and
- sounds that inform without blocking work.

Use message fixtures to check sanitization, embedded content-ID images, remote-image choices, and
attachments that belong to one specific message.

For the installable web app, verify the manifest identity, icons, service-worker registration,
public-only caching, offline fallback, old-cache cleanup, update prompts, notifications, safe
notification navigation, and background badge updates.

Notification changes must cover permission, ownership, multiple devices, current mailbox access,
unread totals, duplicate prevention, expired subscriptions, isolated delivery failures, read-state
refresh, and unsupported devices. Setup changes must cover Cloudflare authorization boundaries,
deployment triggers, and redirects.

## Before you call it done

- Run the repository's full local check. CI and local development use the same primary commands.
- TypeScript repositories must pass formatting, linting, strict type checking, tests, coverage,
  architecture checks, build, and deployment dry-run.
- If several repositories own the behavior, all of them must pass before the change is complete.
- Run deployed staging for behavior that crosses systems.

Every executable repository runs its full check on pull requests and pushes to `main` through the
`CI` workflow and required `quality` check, sometimes shown as `CI / quality` in GitHub.

The site and OAuth relay deploy from successful `main` CI through the protected `production`
Environment. The HQBase app does not: pushes to `main` stop after the quality check and deployment
dry-run. Publishing a signed app release is a separate action that installs the previous stable
version in disposable staging, updates it to the exact candidate, and publishes only that tested
candidate.

Release and staging credentials belong in separate protected GitHub Environments. A local
production deployment is for recovery only and must record its source commit. Where the GitHub plan
supports it, protect `main` from force pushes and deletion and require resolved review conversations
plus the `quality` check.

Next: [Check a deployed change](/docs/maintainers/staging-e2e/) or
[publish a release](/docs/maintainers/releases/).
