---
title: Using multiple domains
description: How workspaces, domains, mailboxes, addresses, and sending fit together.
---

One HQBase deployment owns one workspace and may operate multiple email domains in the same
Cloudflare account and trust boundary. Separate legal, administrative, retention, or residency
boundaries require separate deployments.

## Hosts

The workspace has one mutable canonical portal hostname and one stable machine-facing service
origin. Owners and admins may change the portal after recent reauthentication through an
attach-verify-cutover-redirect workflow with rollback. Portal changes never change the webhook,
recovery, or automation origin.

## Domains, mailboxes, and addresses

- A domain records Cloudflare zone identity and independent receiving, sending, DNS, and catch-all
  state.
- A mailbox is the content, retention, and permission boundary.
- An address is a receiving and sending identity attached to exactly one mailbox and domain.
- Multiple addresses may share one mailbox. If addresses need different access, they must use
  different mailboxes.
- Messages record the exact receiving and sending address identities.
- A connected email domain cannot match any workspace user's Login email domain. HQBase enforces
  the exclusion in both directions: user creation rejects connected domains, and later domain
  connection rejects domains already used for Login emails.

## Authorization

Mailbox grants remain `read`, `agent`, and `manager`. Addresses inherit their mailbox grant.
Owners and admins manage hosts, domains, addresses, catch-all policy, and grants. Admins still need
an explicit mailbox grant to read content. Domain bulk access is a UI operation that writes
explicit mailbox grants; there is no implicit future domain grant.

## Provisioning

Initial setup uses a short-lived Cloudflare OAuth grant held by the customer-owned Worker and
supports active zones selected during Cloudflare consent. The portal, service origin, and every
selected email domain are inspected and provisioned with retry-safe Cloudflare operations. HQBase
revokes the grant and deletes its masked setup secret after setup completes. Additional domains,
portal cutover, and service-origin changes require a fresh operation-specific OAuth grant. HQBase
never asks an owner to paste a Cloudflare API token. Domain disablement preserves mailbox, address,
and message history. Domain connection validates Login email independence before making Cloudflare
changes.
