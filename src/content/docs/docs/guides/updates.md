---
title: Updates
description: Check for a new HQBase release, install it, and recover if something goes wrong.
---

HQBase publishes updates through one public stable channel. Owners and admins can check and start
an update from **Settings → Updates**.

## Check for an update

HQBase checks after sign-in, while the app remains open, and when you return to the browser. When a
newer compatible release is ready, Settings shows **Update available**.

Members do not see infrastructure controls. A temporary network problem does not interrupt the
mail interface; owners and admins can still see the failed check in Settings.

## Install an update

1. In **Settings → Updates**, review the installed and target versions.
2. Confirm that the update is supported, then start it.
3. Approve the temporary Cloudflare permission needed to run the production build.
4. Leave the page open while HQBase verifies, installs, and checks the release.
5. When the new app is ready, choose when to reload it.

HQBase revokes the temporary Cloudflare permission after the build starts. The replacement app
never refreshes the page without asking you first.

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
deployment status, and records the installed release.

Release archives, signed records, checksums, and notes are public GitHub Release assets. See
[Publishing a release](/docs/maintainers/releases/) for the maintainer workflow.
