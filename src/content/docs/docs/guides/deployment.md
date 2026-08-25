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

## Move the workspace address

Use the named deployment operator so the local deployment record, generated Wrangler configuration,
and deployed Worker stay aligned. The hostname must belong to a zone in the same Cloudflare account.
For example, `mail.example.com` belongs to the `example.com` zone. The command needs a short-lived
`HQBASE_DOMAIN_API_TOKEN` with Workers Scripts:Edit and Zone:Read.
Set it only in the terminal that runs the command, and unset it when the command finishes. Wrangler
continues to use its own login:

```bash
pnpm run hqbase -- domain \
  --name production \
  --app-domain mail.example.com \
  --keep-service-origin
```

If Cloudflare Access protects the portal, also set
`HQBASE_DOMAIN_ACCESS_CLIENT_ID` and `HQBASE_DOMAIN_ACCESS_CLIENT_SECRET` to an Access service
token. Keep these credentials short-lived. HQBase sends them as `CF-Access-Client-Id` and
`CF-Access-Client-Secret` headers only for health probes. It never stores or logs them. Unset both
values when the command finishes.

The command attaches the new hostname, waits until it serves the installation, deploys the
configuration, and then makes it the main portal address. The previous hostname stays attached
and redirects people to the new address, so agents, webhooks, and mail discovery keep working.

Use `--move-service-origin` instead of `--keep-service-origin` to move the machine-facing service
origin to the new hostname. Every agent token, OAuth redirect URI, and webhook on the old origin
must then be registered again.

Validate the change without contacting Cloudflare, writing files, or deploying:

```bash
pnpm run hqbase -- domain \
  --name production \
  --app-domain mail.example.com \
  --keep-service-origin \
  --dry-run
```

To remove the previous hostname during the move, move the service origin in the same command. Use
this form instead of the earlier `--keep-service-origin` example. You must then replace the old
agent tokens and webhook URLs, and register the OAuth callbacks on the new origin:

```bash
pnpm run hqbase -- domain \
  --name production \
  --app-domain mail.example.com \
  --move-service-origin \
  --detach-old \
  --yes
```

To remove every custom hostname and serve from the default Worker address:

```bash
pnpm run hqbase -- domain --name production --detach --move-service-origin --yes
```

Both commands delete a Cloudflare DNS record, so they need `--yes`. The command never takes a
hostname from another Worker. Move or remove a conflicting hostname in Cloudflare first.

If a step fails, the command restores the previous Worker configuration, main portal record,
and domain attachments. It clears the move record only after it verifies the restored state. If
rollback is incomplete, it locks other lifecycle commands and prints the failed recovery steps.
Correct the reported problem, then run the same domain command again. Do not replace agent tokens
or webhook URLs until the command commits. A rollback restores the old service origin and its old
integrations. Discard credentials or OAuth flows created against the temporary new origin. A new
customer-managed OAuth callback registration is external to HQBase; remove it separately if the
move does not commit and you no longer need it.

## Remove HQBase

Back up D1 and R2 data first. Then run:

```bash
pnpm run hqbase -- destroy
```

Choose the exact removal scope and confirm it. HQBase uses its saved deployment record to remove
only resources it created; shared or unclear resources are preserved. It saves progress after each
successful removal, so you can correct a Cloudflare error and run the same command again. When
removal includes an R2 bucket that HQBase created, HQBase permanently deletes every object in that
recorded bucket before it deletes the bucket. It never empties a reused bucket.
