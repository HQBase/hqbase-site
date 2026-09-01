---
title: Publishing a release
description: Package, test, sign, and publish an official HQBase release.
---

:::caution[Authorized release maintainers only]
Requires access to HQBase's protected release and staging environments. [Contributors follow the
pull-request workflow](/docs/maintainers/contributing/).
:::

Publishing is a separate action from merging code to `main`. A push to `main` runs the quality check
and a deployment dry-run; it does not create a customer release.

## Before you start

In `HQBase/hqbase`:

1. Set the new stable `X.Y.Z` version and minimum supported version in `package.json`. The signed
   stable channel does not accept a prerelease suffix.
2. Update database compatibility when the release needs it.
3. Add public release notes to `CHANGELOG.md`.
4. Commit those changes to `main`.
5. Run `pnpm check` and `pnpm deploy:dry-run`.

The signing private key must exist only as an encrypted repository secret and in the offline
recovery copy. Never upload it, print it, or write it to a log. Applications and deployment tools
contain only the public key used to verify a release.

The Discord release webhook must exist as the `DISCORD_RELEASE_WEBHOOK_URL` Actions repository
secret. Configure its public name, avatar, and destination channel in Discord. Treat the webhook
URL as a credential because anyone who has it can post to that channel.

## Publish the release

1. From `main`, start the signed-release workflow. The workflow reads the committed version from
   `package.json`; do not type a different version into a form.
2. The workflow creates one release archive and calculates its SHA-256 checksum.
3. It creates and signs two small release records: one for the version and one for the stable
   channel.
4. It uploads the records and archive to a draft GitHub Release named `vX.Y.Z`.
5. Disposable staging uses the oldest supported bootstrap to install the previous stable release,
   creates data, reproduces its legacy Worker configuration, and installs the exact candidate. It
   must prove that the candidate restores the `MAIL_EVENTS` binding while the old bootstrap still
   omits the post-deploy database phase. Staging then calls the candidate's deployed
   `POST /api/updates/apply` product route with a real disposable Workers Builds trigger. It verifies
   that Cloudflare accepts the short command, updater-loader variable, version pin, and build
   request. It cancels that probe build before deployment because the draft release assets are not
   public. The workflow then completes the candidate repair through the direct signed bootstrap.
   Neither proof is sufficient by itself.
6. Staging checks that the authenticated event WebSocket opens before and after database repair. It
   sends the Cloudflare Access service-token headers on the WebSocket upgrade itself. Staging also
   checks that the real trigger contains the short managed command, exact
   `HQBASE_UPDATER_LOADER` value, and reviewed-version pin, and that Cloudflare returns a real build
   identifier. It links that build to the recorded trigger, cancels it, and verifies that the probe
   did not change the active Worker or D1. It checks the active Worker's required bindings and asset
   routes, both D1 migration ledgers, the final schema, preserved data, the installed database
   marker, the deployed app, sign-in, mailbox access, diagnostics, backup, and restore. Each
   remote-D1 schema inspection statement must have no more than five compound `SELECT` terms; a
   local SQLite result is not sufficient. It waits until the public health response reports the
   exact candidate version, so an old healthy Worker cannot pass the gate.
7. The workflow advances the `deploy` branch to the exact validated candidate commit. If
   publication fails while the release is still a draft, it restores the previous branch commit.
8. The workflow publishes the draft only if those checks and the branch update pass.
9. It verifies that `deploy`, the public release, and the signed stable manifest identify the same
   candidate.
10. After the public signature and archive checks pass, the workflow posts the complete release
   notes to Discord. It splits long notes into numbered messages without removing content.

After publication, download `releases/latest/download/stable.json` directly, verify its signature,
download the exact archive it names, confirm the checksum, and open the public release notes.

The Discord message uses the name and avatar configured for the webhook. Its title links to the
GitHub Release, and its body contains the complete release notes for that version. The workflow
disables Discord mentions in release-note text. A Discord delivery failure creates a workflow
warning but does not invalidate an otherwise verified signed release.

Manual staging is still available for a reviewed commit, but the signed-release workflow is the
only path that publishes an official customer release.

HQBase 1.3.4 has one reviewed compatibility exception. Its committed `hqbaseRelease` metadata pins
`updaterCommit` to the HQBase 1.3.3 bootstrap commit and limits that pin with
`updaterCommitVersion: 1.3.4`. The two bootstrap files must have identical bytes. This keeps the
signed updater identity unchanged for a 1.3.3 installation whose current inline command already
matches it. Packaging and public-release verification stop if the pin is missing, unavailable, or
used for another version. Remove both fields before the next release.

The official Deploy to Cloudflare button targets `HQBase/hqbase` at the `deploy` branch. Do not
move that branch by hand. Moving it before publication fails closed because its committed product
version is newer than the previous stable release. Publishing first would expose a new signed
artifact to an older deployment configuration.

## What customers receive

Customers install and update through the normal product flow described in
[Updates](/docs/guides/updates/): the app verifies every signature before it changes anything,
records a recovery checkpoint first, and keeps rollback as a separate deliberate action.

## If the candidate fails

- Before a database migration, stop without changing the installation.
- After the recovery checkpoint but before deployment, leave the existing Worker active.
- After a deployment failure, show the recorded Worker-version and D1-bookmark recovery commands.
- Restore the D1 bookmark only after confirming a data problem; it can discard newer writes.

Fix the cause and create a new candidate. Do not publish a failed draft or quietly replace files in
an existing candidate. If a canceled workflow leaves `deploy` on an unpublished candidate, move it
back to the commit named by the latest published release tag before accepting new installations.

## Evidence required

Local tests must cover:

- a fresh installation;
- an update when the same version is already installed;
- supported and unsupported source versions;
- bad signatures and checksum mismatches; and
- preparation of required Worker bindings and asset routing rules when the oldest supported
  bootstrap supplies the deployment configuration;
- exact detection and repair of each supported post-deploy migration prefix, with a fresh recovery
  checkpoint and an idempotent same-release retry;
- migration from the legacy command and the HQBase 1.3.3 inline command to the short command and
  exact `HQBASE_UPDATER_LOADER` value;
- rejection at each build-command and build-variable operation, with restoration and verification
  of accepted changes before dispatch;
- an ambiguous build dispatch that is reconciled by exact build identity or stops for operator
  review without claiming that no build started;
- stage-specific redacted diagnostics, an attempted temporary-grant revocation after success or
  failure, and grant-cookie removal in both cases; and
- failure handling and the recovery instructions shown to an operator.

Release staging must run the previous stable application and the candidate through the oldest
supported real bootstrap. It must then call the deployed update action with a separate user-scoped
staging API token in the encrypted grant cookie, inspect the real Workers Builds changes and queued
build, cancel that build before deployment, and verify that the probe did not change the Worker or
D1. This proves the product route and Cloudflare request contract, not OAuth token exchange or a
completed remote candidate build. The workflow then completes the signed candidate repair through
the direct bootstrap and passes the full check list of step 6 above. Receiving real public email
through Cloudflare Email Routing remains a separate candidate check until dedicated automation
exists.
