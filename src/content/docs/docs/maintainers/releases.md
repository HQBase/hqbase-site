---
title: Publishing a release
description: Test a Nightly candidate, then promote that exact candidate to Stable.
---

:::caution[Authorized release maintainers only]
Requires access to HQBase's protected release and staging environments. [Contributors follow the
pull-request workflow](/docs/maintainers/contributing/).
:::

## Short playbook

1. **Prepare a candidate.** Give it a new version and release notes. Merge the reviewed code.
2. **Publish Nightly.** Run **Publish Nightly candidate** in GitHub Actions. Wait for all checks.
   Stable customers receive no new upgrade offer.
3. **Test it in real use.** Opt your test workspace into Nightly. Check sending, receiving,
   attachments, search, background jobs, and backup/restore. Record results in a GitHub issue.
4. **Test the next upgrade.** Publish a later candidate. Run **Verify public candidate upgrades**
   with both version numbers. Both upgrade paths must pass.
5. **Record the evidence.** Add the small report below through a reviewed pull request. Confirm
   that no release blocker remains.
6. **Promote.** Run **Promote tested candidate to Stable** with the tested version. The workflow
   verifies the report and keeps the exact archive. Stable customers can then review the upgrade.

You choose how long to test. There is no minimum waiting period.
If a check fails, fix it in a new candidate and test again. Do not reuse a version.
Hotfixes follow the same path. Promotion is always a maintainer decision.

## How publication works

A push to `main` runs the quality check and a deployment dry-run. The Nightly workflow also runs
at 06:00 UTC each day. It publishes only when `package.json` has an unused committed version;
otherwise that scheduled run does nothing. A maintainer can run it manually sooner.

Each candidate uses a permanent `X.Y.Z` number. Rejected candidates can leave gaps in the Stable
version sequence. A candidate does not change its version when promoted.

## Before you start

In `HQBase/hqbase`:

1. Set the new candidate `X.Y.Z` version and minimum supported version in `package.json`. The signed
   installation format does not accept a prerelease suffix.
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

## Nightly checks and publication

1. From `main`, start **Publish Nightly candidate**. The workflow reads the committed version from
   `package.json`; do not type a different version into a form.
2. The workflow creates one release archive and calculates its SHA-256 checksum.
3. It signs a versioned installation record, an identical `stable.json`, and a `nightly.json`
   discovery record. The local `stable.json` is used in staging but is not uploaded to Nightly.
   All records identify the same archive, source commit, and updater. The versioned
   installation format retains `channel: stable` so supported older updaters can install it.
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
7. It publishes the checked draft as a GitHub prerelease with `make_latest: false`.
8. It verifies the public archive, records, tag commit, and updater. It then updates the signed
   Nightly pointer at `releases/download/nightly/nightly.json`.
   If GitHub still serves an older valid pointer, verification makes up to 30 reads, including the
   initial read, two seconds apart. An invalid signature, a newer version, or a changed checksum for the expected version
   stops the check immediately. The expected version and checksum must match before it passes.
9. It verifies that GitHub Latest and the `deploy` branch did not change. It does not send a Stable
   release announcement.

Owners need a release that includes the Nightly setting before they can opt in from the app.
For the first candidate that introduces this setting, maintainers install its signed archive in a
test workspace through the canonical bootstrap. The first Stable promotion then makes the setting
available to other owners.

## Public upgrade proof

After both candidates are public, run **Verify public candidate upgrades** from `main`. Enter the
candidate to promote and a later candidate. The workflow creates disposable resources and tests
these paths in sequence:

- Current Stable to the candidate.
- The candidate to the later candidate.

For each path, it waits for the exact source version to become healthy and records the deployed
Worker in the lifecycle manifest before preparing the update fixture and build trigger. Older
source installers can leave this local deployment flag unset.

It serves a signed discovery fixture to the source app, calls the same `POST /api/updates/apply`
route used by Settings, and lets Workers Builds finish. It checks the exact active archive tag,
installed database version, update history, and preserved data. Mail, lifecycle, PWA, backup, and
restore checks must also pass. Cleanup must finish before the combined evidence artifact is valid.
The discovery fixture lets older Stable apps test the same archive before they support Nightly.

The workflow stores both receipts under `public-upgrade-evidence` for 90 days. If the evidence
expires, rerun the test. If Stable changes, rerun it against the new Stable version.

## Record real use

Open a GitHub issue or discussion for the test report. Record the candidate version and archive
checksum, test start and end times, results, and any faults. Do not include mail content or
credentials. When you decide testing is sufficient, add `release/evidence/X.Y.Z.json` in `HQBase/hqbase`
through a reviewed pull request. Use this structure with your actual values:

```json
{
  "version": "1.4.2",
  "artifactSha256": "COPY THE 64-CHARACTER ARCHIVE SHA256",
  "sourceCommit": "COPY THE 40-CHARACTER SOURCE COMMIT",
  "successorVersion": "1.4.3",
  "publicUpgradeRunId": "COPY THE SUCCESSFUL WORKFLOW RUN ID",
  "reportUrl": "https://github.com/HQBase/hqbase/issues/123",
  "startedAt": "2026-09-02T00:00:00Z",
  "finishedAt": "2026-09-05T00:00:00Z",
  "checks": {
    "send": true,
    "receive": true,
    "attachments": true,
    "search": true,
    "backgroundJobs": true,
    "backupRestore": true,
    "noOpenBlockers": true
  }
}
```

The source commit and checksum are in the decoded signed candidate record. The report is a human
statement of observed use. Automated checks verify its identity, valid dates, required results, and
workflow evidence; they cannot prove that a human used the app. Review it before merging.

## Promote to Stable

From `main`, run **Promote tested candidate to Stable** with the candidate version. It uses the
protected `release` environment. It rejects missing evidence, invalid test dates, a schema
downgrade, changed archives, or unverified upgrade paths. There is no bypass input.

After the evidence passes, the workflow attaches `stable.json` by copying the existing signed
installation record. This keeps accidental GitHub Latest changes from offering an untested
candidate. Candidate releases must remain unlocked until this file is attached.

The workflow advances `deploy` to the tested source commit, then changes the existing GitHub
prerelease to Stable and Latest. It does not compile, repackage, rename, or replace the candidate
archive or versioned records. If publication fails and the release is still a prerelease, it restores
`deploy` only if that branch still points to this candidate. An ambiguous public result stops for
inspection. Do not delete the candidate or replace its assets to retry.

After publication, it verifies `releases/latest/download/stable.json`, the archive digest, and the
`deploy` commit. Only then does it post the complete release notes to Discord. A Discord failure
does not invalidate a verified release. Discord mentions in release notes are disabled.

Customer deployment still builds the fixed source archive with its frozen dependency lockfile.
Promotion preserves the tested source; it does not promise identical compiled bytes across machines.

HQBase 1.3.4 has one reviewed compatibility exception. Its committed `hqbaseRelease` metadata pins
`updaterCommit` to the HQBase 1.3.3 bootstrap commit and limits that pin with
`updaterCommitVersion: 1.3.4`. The two bootstrap files must have identical bytes. This keeps the
signed updater identity unchanged for a 1.3.3 installation whose current inline command already
matches it. Packaging and public-release verification stop if the pin is missing, unavailable, or
used for another version. Remove both fields before the next release.

The official Deploy to Cloudflare button targets `HQBase/hqbase` at the `deploy` branch. Only
Stable promotion moves it. Do not
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
