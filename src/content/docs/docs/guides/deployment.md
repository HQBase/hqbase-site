---
title: Deployment reference
description: Install from a terminal, understand app secrets and resources, or remove HQBase.
---

Most people should use the [Deploy to Cloudflare button](/docs/getting-started/). This page is for
operators who want to install from a terminal or understand exactly what HQBase creates.

HQBase runs in your Cloudflare account. Your mail, application data, Cloudflare credentials, and
app secrets stay there.

## Install from a terminal

From the official public repository, run:

```bash
pnpm install
pnpm hqbase install --name production
```

Choose a short name for the deployment; this example uses `production`. Keep that name for later
operator commands. The installer creates the required Cloudflare resources, applies database
changes, checks the installed release, and saves a non-secret record that recovery and removal
commands can use later.

If provisioning stops after a resource is recorded, run the same install command again with the
same name and options. HQBase resumes from its saved record - see
[The deployment record](#the-deployment-record) for the exact rules.

It installs the current signed stable release from `HQBase/hqbase`, even when the checked-out source
has the same version. HQBase will not overwrite a non-empty Worker unless it can verify that the
Worker contains a valid HQBase release.

## The deployment record

`pnpm hqbase install --name <name>` records the Cloudflare account and the resources it owns in
`.hqbase/deployments/<name>/manifest.json`. Each create request first records a `creating` state,
then `created` once the new resource is verified. A retry re-verifies each created or reused D1,
queue, and R2 identity before it continues: D1 by UUID and name, queues by ID and name, and R2 by
bucket name. A `creating` entry is ambiguous, so the installer stops and keeps the record for
investigation instead of claiming a resource by name alone.

Removal deletes only resources recorded as `created`, preserves anything recorded as `reused`,
saves progress after each deletion, and deletes the Worker before its queues so Worker bindings
cannot block queue removal. Old or incomplete records are refused without changing Cloudflare.

## App secrets

The first Cloudflare Workers Build creates these values if they do not already exist:

- `BETTER_AUTH_SECRET` protects sign-in sessions.
- `VAPID_PUBLIC_KEY` lets browsers subscribe to HQBase notifications.
- `VAPID_PRIVATE_KEY` lets your Worker prove that a notification came from your installation.

An older installation receives a VAPID key pair during its first compatible signed update. Its
existing authentication secret is not changed. Operators can provide the values themselves for
controlled automation.

The VAPID private key never leaves Worker secrets. Browser notification endpoints and encryption
keys stay in D1. Notification payloads are encrypted and contain no sender, recipient, subject,
preview, message body, or attachment information.

Organizations using their own Cloudflare OAuth application provide only its public client ID and
the official HTTPS address of their HQBase installation. Temporary Cloudflare permissions used by
setup and updates are encrypted, limited to that operation, and revoked afterward. See [Use your
own Cloudflare OAuth client](/docs/guides/customer-managed-oauth/) for the registration and
deployment commands.

## Cloudflare resources

By default, HQBase creates:

- Worker: `hqbase-<name>`
- D1 database: `hqbase-<name>`
- R2 bucket: `hqbase-<name>-mail`
- Queue: `hqbase-<name>-jobs`
- Failed-job queue: `hqbase-<name>-jobs-dlq`

You can override these names in installer configuration. A fresh installation creates fresh
resources and supports a custom Worker name.

## Update or roll back

Use [Updates](/docs/guides/updates/) for the normal update flow. Before making a change, the updater
checks the signed release and database compatibility, then records a D1 Time Travel bookmark and
the active Worker version.

If an update fails, HQBase prints separate commands for restoring the Worker and D1. Restoring the
database can discard newer mail or other writes, so it always remains a deliberate choice.

## Remove HQBase

Back up D1 and R2 data first. Then run:

```bash
pnpm run hqbase -- destroy
```

Choose the exact removal scope and confirm it. HQBase uses its saved deployment record to remove
only resources it created; shared or unclear resources are preserved. It saves progress after each
successful removal, so you can correct a Cloudflare error and run the same command again.
