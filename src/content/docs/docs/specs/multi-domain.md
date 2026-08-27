---
title: Using multiple domains
description: How workspaces, domains, mailboxes, and sending fit together.
---

One HQBase deployment owns one workspace and may operate multiple email domains in the same
Cloudflare account and trust boundary. Separate legal, administrative, retention, or residency
boundaries require separate deployments.

## Hosts

The workspace has one mutable canonical portal hostname and one stable machine-facing service
origin. Owners and admins may change the portal after recent reauthentication through an
attach-verify-cutover-redirect workflow with rollback. Portal changes never change the webhook,
recovery, or automation origin.

## Operator portal moves

This contract applies to the terminal operator command. It does not change the setup wizard or the
in-app portal cutover.

- `pnpm run hqbase -- domain --name <name> --app-domain <host>` moves the canonical portal hostname
  with an attach, verify, cutover, redirect sequence. It updates the canonical portal row in D1,
  but it does not change mail data or the identities of D1, R2, and queue resources.
- The command records the proposed move in `.hqbase/deployments/<name>/manifest.json` before the
  first Cloudflare change, and saves the new hostname only after every step is verified. Other
  lifecycle commands refuse to run while a move is unfinished.
- Verification attaches the hostname, confirms that Cloudflare reports it for this Worker, and reads
  the installation discovery document on the new hostname before any cutover.
- The cutover deploys configuration for the release that is already active, then confirms that the
  installation advertises the expected service origin.
- The previous hostname stays attached and redirects browsers to the canonical portal. Its API, MCP,
  and mail discovery answers do not change. Removal is a separate confirmed step.
- A portal move does not move the machine-facing service origin. When the service origin is served
  by the hostname that is replaced, the command stops and asks the operator to keep it or move it.
  Keeping it preserves the exact setup, domain, and update OAuth callback URLs on the old HTTPS
  origin, which stays attached. The `/api/setup/cloudflare/oauth/callback`,
  `/api/domains/cloudflare/oauth/callback`, and `/api/updates/cloudflare/oauth/callback` routes
  bypass the browser portal redirect, so new OAuth flows continue to use those registered URLs.
  Moving the service origin changes those callback URLs. For customer-managed OAuth, the operator
  must register the three exact callbacks on the new origin before a new OAuth flow. Moving it also
  ends every agent token and webhook registered on the old origin.
- The command reads and writes Worker custom domains through the Cloudflare API, so a hostname that
  already routes to another Worker is refused. It never uses Cloudflare's implicit origin or DNS
  override behavior.
- The terminal command uses a short-lived `HQBASE_DOMAIN_API_TOKEN` with Workers Scripts:Edit and
  Zone:Read. The token is not stored, logged, sent to the HQBase Worker, or used by Wrangler.
- Cloudflare Access probes can use short-lived `HQBASE_DOMAIN_ACCESS_CLIENT_ID` and
  `HQBASE_DOMAIN_ACCESS_CLIENT_SECRET` values. HQBase sends them only as `CF-Access-Client-Id` and
  `CF-Access-Client-Secret` headers. It does not store or log them. The operator unsets both values
  after the command.
- The command records a deploy, canonical-row update, or domain deletion before it sends the
  request. A failure restores the prior domains, canonical row, and Worker configuration. It clears
  the move record only after it verifies the restored state. An incomplete rollback keeps the
  deployment locked until the operator corrects the error and runs the same command again. The
  operator does not replace agent tokens or webhooks before commit. A rollback restores the old
  service origin and integrations; credentials or OAuth flows created against the temporary new
  origin are discarded. Customer-managed OAuth callback registrations are external and must be
  removed separately after a rollback if the operator no longer needs them.
- Staging acceptance moves a live staging installation to a second hostname and back. It verifies
  the portal and service-origin contract after each move.

## Domains and mailboxes

- A domain records Cloudflare zone identity and independent receiving, sending, DNS, and catch-all
  state.
- A mailbox is the content, retention, permission, receiving, and sending boundary. It owns exactly
  one email address on exactly one connected domain.
- Each email address requires its own mailbox. The mailbox switcher and **All mailboxes** view let a
  person work across the mailboxes they can access.
- An agent mailbox uses the same one-address model. A provisioner can create it only on a domain
  that is already connected to this workspace.
- Messages record the exact envelope recipient and sender address.
- Each domain has one policy for mail sent to an address that does not match an active mailbox.
  Exact mailbox addresses always take priority. The domain can reject unmatched mail, keep it as
  owner-only unassigned mail, or deliver it to one active human mailbox on that domain. A dedicated
  agent mailbox cannot be the catch-all destination.
- Mail delivered to a catch-all mailbox is normal Inbox mail for that mailbox. It keeps the exact
  envelope recipient, uses the mailbox's access and retention rules, and replies from the mailbox
  address instead of the unmatched recipient address.
- A catch-all policy change affects only new mail. It never moves existing mailbox or unassigned
  mail. An owner or admin must choose another destination or change the policy before disabling or
  deleting the current catch-all mailbox.
- Soft-deleting a mailbox preserves its mailbox ID, address, messages, and audit history. It
  disables receiving and sending without moving historical mail to Catch-all. New mail to its
  inactive address follows the domain's normal unmatched-mail policy. Restoring the mailbox
  reactivates the same mailbox and address.
- Disconnecting an email domain stops new receiving and sending in HQBase but preserves the
  domain, mailboxes, messages, drafts, attachments, and audit history. HQBase disables the
  catch-all rule only when the enabled rule has one action and that action targets this HQBase
  Worker. It does not disable shared Email Routing, Email Sending, or DNS, and it does not change a
  catch-all rule that another destination controls. Delayed mail that still reaches the Worker is
  rejected. Disconnect also changes the unknown-address policy to rejection so no mailbox remains
  selected as the catch-all destination.
- Connecting a disconnected domain again restores its connected state and current Cloudflare
  readiness. The owner or admin must review the unknown-address policy, which remains set to
  rejection until they change it.
- Forgetting a domain is a separate local deletion. It requires the exact domain name, applies only
  to a disconnected domain, and is blocked while any mailbox, agent, domain signature, or stored
  message history belongs to that domain. HQBase keeps audit events that identify the forgotten
  domain. If the domain is the workspace's primary domain, another connected domain becomes the
  primary domain. HQBase blocks forgetting the last stored domain. Disconnecting or forgetting an
  email domain does not detach a portal hostname on the same Cloudflare zone.
- A connected email domain cannot match any workspace user's Login email domain. HQBase enforces
  the exclusion in both directions: user creation rejects connected domains, and later domain
  connection rejects domains already used for Login emails.

## Authorization

Mailbox grants remain `read`, `agent`, and `manager`. Owners and admins manage hosts, domains,
mailboxes, catch-all policy, and grants. People and machine agents need explicit grants. Admins
still need an explicit mailbox grant to read content. Domain bulk access is a UI operation that
writes explicit mailbox grants; there is no implicit future domain grant.

## Provisioning

Initial setup uses a short-lived Cloudflare OAuth grant held by the customer-owned Worker and
supports active zones selected during Cloudflare consent. The portal, service origin, and every
selected email domain are inspected and provisioned with retry-safe Cloudflare operations. HQBase
revokes the grant and deletes its masked setup secret after setup completes. Additional domains,
portal cutover, and service-origin changes require a fresh operation-specific OAuth grant. HQBase
never asks an owner to paste a Cloudflare API token. Domain disablement preserves mailbox and
message history. Domain connection validates Login email independence before making Cloudflare
changes.

An owner or admin can recheck a connected domain with a fresh operation-specific OAuth grant. The
recheck reads the Cloudflare zone, routing, catch-all Worker route, DNS, and Email Sending state. It
updates only the stored receiving, sending, DNS, zone, account, and verification values. It does
not repair or reconfigure Cloudflare. HQBase records the audit result and revokes the grant.

An owner or admin can disconnect a domain after recent reauthentication and a fresh
operation-specific OAuth grant. The operation verifies the stored zone before it changes the
HQBase-owned catch-all rule, records success or failure, revokes the grant, and can be repeated
safely. A disconnected domain stays reserved against workspace Login emails until an owner or admin
forgets it.

During initial setup, the owner chooses the unmatched-mail policy for every selected domain. New
installations start with delivery to the first human mailbox on that domain selected in the form.
Domains connected after setup start with owner-only review until an owner or admin chooses another
policy.
An upgrade preserves the earlier effective behavior by setting existing domains to owner-only
unassigned mail until an owner or admin chooses a different policy.

A provisioner uses the separate Management API to create a dedicated mailbox and its address, a
mailbox agent, and an explicit grant. It cannot connect or reconfigure a domain. It receives the
child mailbox agent credential once and is therefore a trusted credential issuer. If the response
is lost, it can list only its own mailbox agents and replace a child credential. Credential
creation and its audit record commit together. It can deprovision only a dedicated child mailbox
that it created. Deprovisioning uses the same soft deletion as Settings and disables that child
agent.
Disabling a mailbox agent preserves its active mailbox, address, messages, and audit history.
Disabling a provisioner stops new provisioning but does not disable its existing mailbox agents.
