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

1. Set the new version and minimum supported version in `package.json`.
2. Update database compatibility when the release needs it.
3. Add public release notes to `CHANGELOG.md`.
4. Commit those changes to `main`.
5. Run `pnpm check` and `pnpm deploy:dry-run`.

The signing private key must exist only as an encrypted repository secret and in the offline
recovery copy. Never upload it, print it, or write it to a log. Applications and deployment tools
contain only the public key used to verify a release.

## Publish the release

1. From `main`, start the signed-release workflow. The workflow reads the committed version from
   `package.json`; do not type a different version into a form.
2. The workflow creates one release archive and calculates its SHA-256 checksum.
3. It creates and signs two small release records: one for the version and one for the stable
   channel.
4. It uploads the records and archive to a draft GitHub Release named `vX.Y.Z`.
5. Disposable staging installs the previous stable release, creates a workspace, and updates it to
   the exact candidate through the normal customer update path.
6. Staging checks the deployed app, sign-in, mailbox access, diagnostics, backup, and restore.
7. The workflow publishes the draft only if those checks pass.

After publication, download `releases/latest/download/stable.json` directly, verify its signature,
download the exact archive it names, confirm the checksum, and open the public release notes.

Manual staging is still available for a reviewed commit, but the signed-release workflow is the
only path that publishes an official customer release.

## What customers see

- Owners and admins see **Update available** only when a newer compatible signed release exists.
- **Settings → Updates** explains the installed version, target version, compatibility, recovery
  checkpoint, and rollback options.
- The customer approves a short-lived Cloudflare permission for the specific Workers Build. HQBase
  revokes it after the build starts.
- The build reads the installed version from the active production Worker and verifies the public
  release record and archive. It never labels unsigned source as a released version.

## If the candidate fails

- Before a database migration, stop without changing the installation.
- After the recovery checkpoint but before deployment, leave the existing Worker active.
- After a deployment failure, show the recorded Worker-version and D1-bookmark recovery commands.
- Restore the D1 bookmark only after confirming a data problem; it can discard newer writes.
- Stop before extraction or migration when a signature or checksum is wrong, the product does not
  match, the installed version is unsupported, or a required file is unavailable.

Fix the cause and create a new candidate. Do not publish a failed draft or quietly replace files in
an existing candidate.

## Evidence required

Local tests must cover:

- a fresh installation;
- an update when the same version is already installed;
- supported and unsupported source versions;
- bad signatures and checksum mismatches; and
- failure handling and the recovery instructions shown to an operator.

Release staging must install the previous stable signed release and apply the exact candidate
through the normal updater before checking health, login, mailbox access, diagnostics, backup, and
restore.

Receiving real public email through Cloudflare Email Routing remains a separate candidate check
until dedicated automation exists.
