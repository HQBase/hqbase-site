---
title: Getting started
description: Install HQBase in your Cloudflare account and create your workspace.
---

HQBase runs in your Cloudflare account. Before you install it, you only need a paid Workers plan,
an active R2 subscription, and a domain using Cloudflare DNS.

## What you need

Complete these three steps in the Cloudflare account where HQBase will run:

1. **Enable Workers Paid.** Review the
   [Workers plans](https://developers.cloudflare.com/workers/platform/pricing/) and enable Workers
   Paid for the account. This is separate from any Free, Pro, or Business plan attached to your
   domain.
2. **Activate the R2 subscription.** In the Cloudflare dashboard, open **Storage & databases → R2
   → Overview** and complete the R2 checkout. R2 includes free monthly usage, but its subscription
   must be active before you install HQBase.
3. **Have an active domain using Cloudflare DNS.** If your domain is not active in this account,
   [add it to Cloudflare](https://developers.cloudflare.com/fundamentals/manage-domains/add-site/),
   review the imported DNS records, update the nameservers at your registrar, and wait for
   Cloudflare to mark the domain **Active**.

You do not need to turn on Email Routing or Email Sending yourself. HQBase configures both after
you give it permission during setup.

## Install HQBase

Use the official **Deploy to Cloudflare** button:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2FHQBase%2Fhqbase%2Ftree%2Fdeploy)

The button always uses the source commit of the latest signed HQBase release. Cloudflare will ask
you to choose an account and approve the resources HQBase needs. It then opens HQBase's setup page.

You can safely leave and return to setup later. HQBase remembers where you stopped.

## Finish setup

HQBase guides you through four steps:

1. check and create the required Cloudflare resources;
2. connect one or more email domains;
3. create the workspace owner account;
4. create your shared mailboxes, such as `support@example.com` or `hello@example.com`.

Use a personal or company login address that will remain available if HQBase is offline. For
example, if the workspace uses `example.com`, the owner could sign in with a Gmail address or an
address on another company domain. The login address cannot belong to a domain connected to this
HQBase workspace.

Your login identifies you; it is not automatically a shared mailbox. After setup, add people and
choose which mailboxes each person can use from **Settings**.

## What HQBase creates

HQBase creates the Worker, database, file storage, queues, routes, and app secrets in your
Cloudflare account. Your workspace and email stay there. See [How HQBase works](/docs/architecture/)
for a plain-language overview.
