---
title: Email setup and troubleshooting
description: See what HQBase configures and fix common sending or receiving problems.
---

HQBase needs a domain whose DNS is managed by Cloudflare. The domain can be registered anywhere.
If setup finishes successfully, there is no separate Email Routing or Email Sending step for you
to complete.

## What you need to do

Before installing HQBase, make sure the domain:

- is active in the same Cloudflare account where HQBase will run; and
- uses Cloudflare DNS.

If the domain is not on Cloudflare yet, [add it to
Cloudflare](https://developers.cloudflare.com/fundamentals/manage-domains/add-site/), review the
imported DNS records, update the nameservers at your registrar, and wait until Cloudflare marks the
domain **Active**.

Domains that use another DNS provider are not supported.

## Connect the domain during setup

After deployment, HQBase opens `/setup`:

1. Approve the Cloudflare account, zones, and permissions HQBase requests.
2. Choose the primary email domain and the subdomain where the HQBase app will live.
3. Select **Connect domain and continue**.
4. Wait while HQBase configures Cloudflare and checks the result.

HQBase continues to owner setup only after the required checks pass. The owner's login email must
remain available when HQBase is offline, so it cannot use a domain connected to this workspace.

## What HQBase configures

With the temporary Cloudflare permission approved during setup, HQBase:

- connects the chosen app hostname to the Worker;
- enables Email Routing DNS for each selected domain;
- sends all incoming mail for the domain to the HQBase Worker;
- enables Email Sending when the account has Workers Paid; and
- checks that receiving and sending are ready before continuing.

The deployment flow has already created the Worker, D1 database, R2 bucket, queues, and bindings.
The temporary Cloudflare access token is stored only as a masked Worker secret. HQBase deletes and
revokes it after setup.

## Fix a receiving problem

Check these items if new mail does not appear:

- Email Routing or Email Service is enabled for the domain.
- The catch-all rule is enabled and points to the deployed HQBase Worker.
- The Worker has its D1 binding and the `MAIL_OBJECTS` R2 binding.

If Cloudflare shows `Authentication error` for Email Routing DNS, approve **Zone Settings / Edit**
and restart authorization.

## Fix a sending problem

Check these items if HQBase cannot send:

- Cloudflare Email Sending is enabled for the domain.
- The Worker has the `send_email` binding named `MAIL_SENDER`.
- The sender mailbox uses a connected domain.
- The domain has the required SPF, DKIM, and DMARC DNS records.

If attachments are missing, confirm that the `MAIL_OBJECTS` R2 bucket exists and is bound to the
Worker.

## Technical details

Setup requests these Cloudflare permissions:

- Account / Email Sending / Edit
- Account / Workers Scripts / Edit
- Zone / Zone / Read
- Zone / Zone Settings / Edit
- Zone / Email Routing Rules / Edit

Cloudflare separates Email Routing rules from Email Routing zone settings. The catch-all Worker
route uses Email Routing Rules permission, while enabling Email Routing DNS and settings requires
Zone Settings access.

For a repeatable development installation, run:

```sh
pnpm hqbase:install --name dev-01 --domain example.com
```

To remove only the domain configuration created by that operator, run:

```sh
pnpm hqbase:reset --name dev-01 --scope domain
```

This disables the catch-all Worker route and disables Email Sending or Email Routing only if the
operator enabled them.
