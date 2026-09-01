---
title: Updates
description: Check for a new HQBase release, install it, and recover if something goes wrong.
---

HQBase publishes updates through one public stable channel. Owners and admins can check and start
an update from **Settings → Updates**.

## Check for an update

HQBase checks after sign-in, while the app remains open, and when you return to the browser. When a
newer compatible release is ready, Settings shows **Update available**.

The update banner and **Settings → Updates** show the target release changelog before installation.
The list comes from the signed release record and describes the features and fixes in the exact
version being offered. A link opens the complete public release notes. HQBase keeps the currently
displayed notes if a later check fails.

Members do not see infrastructure controls. A temporary network problem does not interrupt the
mail interface; owners and admins can still see the failed check in Settings.

## Install an update

1. In **Settings → Updates**, review the installed and target versions and their changelog.
2. Confirm that the update is supported, then start it.
3. Approve the temporary Cloudflare permission needed to prepare and run the production build.
4. Leave the page open while HQBase pins, verifies, installs, and checks that exact release.
5. When the new app is ready, choose when to reload it.

HQBase attempts to revoke the temporary Cloudflare permission after the build starts and always
removes its local grant cookie. The replacement app never refreshes the page without asking you
first.

An installation created with an older Deploy to Cloudflare button can show **Finish installation
repair** after its first update. Approve Cloudflare access once more. HQBase then replaces the old
build bootstrap and safely completes the same signed release. It does not change or synchronize the
customer-owned source repository. Later managed updates use the signed HQBase updater in one build.

To keep updates safe, HQBase installs only the version you reviewed. It does not silently switch to
a newer release while the update starts. Future automatic builds also stay on that version until
you approve another update.

In-app updates require the standard HQBase build setup at the repository root. HQBase accepts its
historical `pnpm deploy` bootstrap, the updater form used by HQBase 1.3.3, and the current short
HQBase updater command. The short command reads the non-secret `HQBASE_UPDATER_LOADER` build
variable. HQBase creates this verified loader from the immutable updater source and digest in the
signed release record. If your production build enables `HQBASE_FORCE_SOURCE_DEPLOY`, uses another
directory, or runs another deploy command, update it the same way you deploy your own source
changes. This is usually your CI pipeline or a trusted local checkout.

Only one update can start at a time. If an update is already starting, wait a moment and check
again.

## Recover the HQBase 1.3.3 repair action

HQBase 1.3.3 can show **Invalid request body** after Cloudflare authorization when you select
**Finish repair**. In this observed failure, the installed update action cannot start its
replacement. Repeating authorization does not fix it. The installation remains in the repair state
that HQBase detected after the earlier update.

HQBase 1.3.4 keeps the same verified updater identity as 1.3.3 for this recovery. An installation
whose current updater command already has that identity can install 1.3.4 through the normal update
action. Use the steps below only if the action still reports **Invalid request body**.

Use this recovery only if all these conditions are true:

- HQBase reports version 1.3.3 and **Repair required**;
- Workers Builds runs from the repository root;
- `package.json` still defines `pnpm deploy` as `node scripts/release/deploy.mjs`;
- `HQBASE_FORCE_SOURCE_DEPLOY` is not enabled; and
- the customer source checkout does not contain custom deployment changes.

For a custom-source installation, use its normal reviewed CI or local deployment process instead.

After HQBase 1.3.4 is public, complete this one-time recovery:

1. Open the production HQBase Worker in the Cloudflare dashboard, then open its Workers Builds
   configuration.
2. Record the current deploy command and the current value, or absence, of
   `HQBASE_EXPECTED_RELEASE_VERSION`. Keep this record with the build log until repair is complete.
3. Set the production deploy command to `pnpm deploy`.
4. Set the plain Workers Builds variable `HQBASE_EXPECTED_RELEASE_VERSION` to `1.3.4`.
5. Start one production build for `main`. Do not continue until the Worker reports HQBase 1.3.4.
6. Return to **Settings → Updates** and select **Finish repair** once.
7. Wait until HQBase no longer reports **Repair required**, then confirm that Connections loads and
   that the live event connection opens.

If the first build fails, stop. Keep its complete log and do not select **Finish repair**. The legacy
updater prints the recorded Worker version and D1 bookmark when recovery instructions are required.
Restore D1 only after you confirm a data problem because a restore can discard newer mail and other
changes.

The first build uses the installed legacy updater to verify and install the public signed HQBase
1.3.4 release. It can deploy a new Worker version, apply normal D1 migrations, and record a recovery
bookmark. The 1.3.4 action then creates a fresh checkpoint, installs the short managed command and
`HQBASE_UPDATER_LOADER`, restores the release-managed Worker configuration, completes the pending
post-deploy migration phase, and verifies the result. These steps change the customer-owned Worker,
Workers Builds configuration, and D1 database. They do not patch, reset, or synchronize the
customer source repository.

## What HQBase protects before updating

Before changing D1, HQBase:

- verifies that the release was signed by HQBase and has not been changed;
- confirms that it is for HQBase and works with your installed version and database;
- validates that the release build contains every required Worker binding and migration;
- records the active Worker version; and
- creates a D1 Time Travel bookmark.

This checkpoint gives you a known Worker version and database point to recover from if a later step
fails.

## If something goes wrong

A failure before a database change leaves the existing database unchanged. A failure after the
checkpoint prints exact commands for recovering the Worker and D1 database.

These are separate choices. Rolling back the Worker restores application code. Restoring D1 can
discard mail and other changes made after the bookmark, so HQBase never does it automatically.
Database changes only move forward within a supported release line.

## Technical details

The updater downloads the signed release record directly from:

`https://github.com/HQBase/hqbase/releases/latest/download/stable.json`

It verifies the Ed25519 signature and trusted key ID; the product, channel, and version; database
compatibility; and the downloaded archive's URL, SHA-256 digest, size, publication time, and release
notes. Compatibility comes from this signed release data rather than a version hard-coded into the
app.

The signed release record also identifies the HQBase updater protocol, immutable source, and
SHA-256 digest. Before a build starts, HQBase writes `HQBASE_UPDATER_LOADER` and the exact reviewed
version to plain Workers Builds variables, installs the short managed command, and verifies those
values. The loader verifies the immutable updater before it runs. The updater verifies the signed
record again, downloads the immutable archive from the official public repository, records the
recovery checkpoint, applies compatible forward database changes, deploys, checks Cloudflare's
deployment status, completes post-deploy database changes, and then records the installed release.
A same-release repair records a fresh checkpoint before it completes an omitted post-deploy phase.
The archive prepares and validates its required Worker configuration before upload, so an update
from an older supported release cannot omit a new release-managed binding. The current updater also
checks the required bindings and final migration ledger on Cloudflare. The deploy command refuses a
different version. HQBase keeps the reviewed version for later automatic builds until you approve
another update. HQBase reports a Cloudflare configuration or build-dispatch failure as the exact
failed operation. It does not report that failure as unavailable authorization.

Release archives, signed records, checksums, and notes are public GitHub Release assets. See
[Publishing a release](/docs/maintainers/releases/) for the maintainer workflow.
