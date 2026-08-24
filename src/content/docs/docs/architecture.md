---
title: How HQBase works
description: See where HQBase runs and how email moves through it.
---

HQBase is a shared email workspace that runs in your Cloudflare account. Your application, email,
workspace data, and app secrets stay in infrastructure you control.

## What this means

- **You host the product.** HQBase does not run a central email service that stores customer mail.
- **Cloudflare provides the building blocks.** HQBase connects them and gives you one web app for
  reading, sending, and managing shared email.
- **The public website is separate.** `hqbase.io` contains the product page and documentation. It
  does not run your workspace or handle your mail.

## How the pieces fit together

| Cloudflare service | What it does for HQBase |
| --- | --- |
| Worker | Serves the web app and APIs, receives email, and performs approved actions. |
| D1 | Stores people, machine agents, mailbox access, searchable email information, drafts, and app state. |
| R2 | Stores original email files and attachments. |
| Queues | Runs background work. Failed jobs move to a separate queue so they can be investigated. |
| Email Routing | Delivers incoming email to HQBase. |
| Email Sending | Sends email from your shared mailboxes. |

The web app, sign-in system, and product APIs all run through your Worker. Customer email,
workspace data, app secrets, and Cloudflare credentials are not copied to an HQBase-operated app.

## How mail moves

When someone emails `support@example.com`, Cloudflare Email Routing passes the message to your
HQBase Worker. HQBase stores the original message and attachments in R2, then stores the searchable
information in D1 so the inbox can load quickly.

When a teammate replies, the Worker first checks that they can send from the `support@example.com`
mailbox. Cloudflare Email Sending delivers the reply, and HQBase adds it to **Sent**.

The same mailbox access rules protect the web app, APIs, and MCP connections used by AI tools.

A machine agent uses a separate bearer credential with the same Mail API. It can reach only its
granted mailbox. The authenticated event WebSocket can wake it when a REST change feed may have
new work, but the event contains no mail content. See [Agent mailboxes](/docs/agent-mailboxes/).

## Installation and updates

You install HQBase from the official public [`HQBase/hqbase`](https://github.com/HQBase/hqbase)
repository. Updates also come from that repository as signed releases.

Before an update changes anything, HQBase checks the downloaded release and records the current
Worker and database state. If an update fails, it prints the commands needed to investigate or
roll back; it does not silently replace your data.

## Technical details

The interface is a Vite-built React app, and sign-in uses Better Auth with identity data stored in
D1. Updates verify a signed release manifest and archive digest before deployment, then create a
checkpoint for the existing Worker and D1 database.

Setup and updates can use a short-lived Cloudflare OAuth permission. HQBase limits it to the
current operation and revokes it afterward. The public AGPL OAuth relay at `auth.hqbase.io` only
returns a short-lived authorization code to your Worker; it never exchanges that code or receives
an access token. Organizations that block the public OAuth application can register their own
Cloudflare client and send callbacks directly to their HQBase Worker.
