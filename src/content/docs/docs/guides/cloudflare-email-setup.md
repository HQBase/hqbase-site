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
5. For every domain, choose whether unknown addresses go to a mailbox, stay in owner-only
   Catch-all, or are rejected.

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

Cloudflare sends domain mail to the HQBase Worker. HQBase gives an exact active mailbox address
priority, then applies the domain's unknown-address policy. Changing that policy in **Settings →
Email domains** affects new mail only.

## Manage a connected domain

**Settings → Email domains** keeps each domain, its combined readiness, its unknown-address policy,
and its **Active in HQBase** switch in one table. Open the readiness status to see Receive, Send,
and DNS separately. If one component needs attention, the table names it instead of showing only a
general degraded state.

Select **Recheck** to authorize one read-only Cloudflare inspection. HQBase updates the stored
readiness snapshot and revokes the temporary grant. Recheck does not change Cloudflare. Reloading
the page alone does not inspect Cloudflare again.

The **Active in HQBase** switch does not disconnect Cloudflare or remove Email Routing, Email
Sending, catch-all, or DNS configuration.

Open the row actions and select **Disconnect domain** to stop receiving and sending through HQBase.
After confirmation, authorize one Cloudflare change. HQBase disables the catch-all only when its
only action points to this HQBase Worker. It leaves shared Email Routing, Email Sending, DNS, and
the workspace portal unchanged. The domain's mailboxes and all existing mail stay available for
reading.

A disconnected row offers **Reconnect domain** and **Forget domain**. Reconnect uses the normal
connection flow. Forget removes the local domain record and requires the exact domain name. It is
available only when the domain has no mailbox, agent, domain signature, or stored mail history. You
must keep at least one domain in the workspace.

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
