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
3. Approve the temporary Cloudflare permission needed to run the production build.
4. Leave the page open while HQBase pins, verifies, installs, and checks that exact release.
5. When the new app is ready, choose when to reload it.

HQBase revokes the temporary Cloudflare permission after the build starts. The replacement app
never refreshes the page without asking you first.

To keep updates safe, HQBase installs only the version you reviewed. It does not silently switch to
a newer release while the update starts. Future automatic builds also stay on that version until
you approve another update.

In-app updates require the standard HQBase build setup: the repository root and the `pnpm deploy`
command. If your production build enables `HQBASE_FORCE_SOURCE_DEPLOY`, uses another directory, or
runs another deploy command, update it the same way you deploy your own source changes. This is
usually your CI pipeline or a trusted local checkout.

Only one update can start at a time. If an update is already starting, wait a moment and check
again.

## What HQBase protects before updating

Before changing your installation, HQBase:

- verifies that the release was signed by HQBase and has not been changed;
- confirms that it is for HQBase and works with your installed version and database;
- records the active Worker version; and
- creates a D1 Time Travel bookmark.

This checkpoint gives you a known Worker version and database point to recover from if a later step
fails.

## If something goes wrong

A failure before a database change leaves the existing installation unchanged. A failure after the
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

The production build downloads the immutable archive from the official public repository, records
the recovery checkpoint, applies compatible forward database changes, deploys, checks Cloudflare's
deployment status, and records the installed release. Before the build starts, HQBase records the
exact signed version that you reviewed. The deploy command refuses a different version. HQBase
keeps the reviewed version for later automatic builds until you approve another update.

Release archives, signed records, checksums, and notes are public GitHub Release assets. See
[Publishing a release](/docs/maintainers/releases/) for the maintainer workflow.
