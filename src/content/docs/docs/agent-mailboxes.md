---
title: Agent mailboxes
description: Give a machine agent its own email address and only the mailbox access it needs.
---

An agent mailbox gives an automated service direct access to one HQBase mailbox without creating a
person account. Use an existing mailbox or create a dedicated mailbox with its own address. The
agent identity, mailbox, messages, and stored credential record stay in your Cloudflare account.
You choose where the agent itself runs.

Dedicated agent mailboxes appear in the header under **Agent mailboxes**. An existing mailbox keeps
its normal position when you also give an agent access to it.

## Choose a machine identity

An owner or admin manages machine identities from the primary **Agents** section.

| Page | What it does |
| --- | --- |
| **Mailbox agents** | Create identities that read or act on mail in one exact mailbox. |
| **Provisioning keys** | Create credentials for trusted software that provisions mailbox agents through the Management API. A provisioning key cannot call the Mail API. |

HQBase shows the new bearer credential once. After **Agents** creates, rotates, or reactivates a
machine credential, the credential dialog also shows the skill URL for that agent type. Copy both
to the service that will run the agent, then close the dialog.

## Choose mailbox access

A mailbox agent can have **Read** or **Handle mail** access. **Handle mail** is the public name for
HQBase's existing internal `agent` permission. It adds organizing, sending, and replying. Either
grant applies to the complete mailbox, including its current and future messages and attachments.
HQBase does not filter individual messages for an agent.

The agent cannot see another mailbox or a mailbox created later. Machine agents can never see
unassigned catch-all mail. The mailbox agent receives only the grant selected during creation.

For example, a mailbox agent with **Handle mail** access to `support@example.com` can read,
organize, send, and reply from that mailbox. It cannot see `billing@example.com`.

## Connect a mailbox agent

Use the mailbox agent credential as a bearer token with the existing Mail API at `/api/v2`. The
same message, conversation, label, attachment, draft, send, reply, and forward endpoints used by
other clients apply the agent's current mailbox access on every request.

Give the agent the mailbox skill shown after credential creation:

```text
https://mail.example.com/skills/hqbase-mailbox/SKILL.md
```

**Agents → Mailbox agents** provides the create action, existing mailbox-agent list, and public
skill URL. The skill contains no credential or mail content.

Drafts remain private to the identity that created them. A person cannot open a machine agent's
draft, even when both can use the same mailbox. Private draft labels transfer to the new outbound
message after a successful send.

The authenticated WebSocket at `/api/v2/events` can wake the agent when a synchronization feed may
have new work. A wake-up contains only a topic, not mail content or message identifiers. The agent
then reads the authoritative changes from the Mail API. It can poll the same feeds if the socket is
not available.

MCP remains a connection for an AI tool that acts for a signed-in person. A machine agent
credential does not work with `/mcp` or `/mcp/full`. See [Connect an AI tool](/docs/mcp/) for that
separate workflow.

## Use a provisioning key

A provisioning key uses its bearer credential with `/management/v1`. Internally, it represents a
machine identity with the `provisioner` profile. It can create a dedicated mailbox with one address,
a mailbox agent, and access to that mailbox on a domain that is already connected to HQBase. It
cannot use its Management API credential with the Mail API. It cannot connect a domain.

Give the provisioning service its separate skill:

```text
https://mail.example.com/skills/hqbase-provisioner/SKILL.md
```

**Agents → Provisioning keys** shows the create action, existing keys, and this URL. Do not give a
provisioning key the mailbox skill.

It creates one mailbox agent per request:

```http
POST /management/v1/agents
Authorization: Bearer hqb_agent_<provisioner-secret>
Content-Type: application/json

{
  "profile": "mailbox",
  "name": "Orders agent",
  "accessLevel": "agent",
  "mailbox": {
    "address": "orders-agent@example.com",
    "displayName": "Orders agent"
  }
}
```

The response contains the new mailbox agent credential once. The provisioner skill identifies the
mailbox skill that the controller must pass with each child credential. Pass the credential to the
new agent through a secure channel.

If the response is lost, do not create the mailbox again. Use `GET /management/v1/agents` to find
the mailbox agents created by this provisioner. Then use
`POST /management/v1/agents/{agent-id}/credential` to create a replacement credential. The old
credential stops working. A provisioner cannot list or replace credentials for other agents.

The provisioner's own credential cannot call the Mail API. However, the provisioner receives each
new mailbox agent credential, so it can delegate or retain that mailbox access. Run it as a trusted
control-plane service. Do not use an untrusted mail-processing agent as the provisioner.

## Disable or deprovision safely

Disabling a mailbox agent or provisioning key stops its credentials from authorizing new requests.
It does not delete or deactivate the mailbox. For a mailbox agent, HQBase keeps the active mailbox,
address, messages, and audit history. Mail sent to the address still belongs to that mailbox.
Disabling a provisioning key stops new provisioning but does not disable the mailbox agents that it
already created.

An owner or admin can select **Delete mailbox** in **Settings → Mailboxes**. This is a reversible
soft deletion. It preserves the mailbox ID, address, messages, drafts, attachments, and audit
history under the current retention rules, but hides them from normal mail views and stops
receiving and sending. HQBase disables every linked agent and revokes its credentials. New mail to
the inactive address follows the domain's normal unmatched-mail policy.

A provisioner can perform the same operation only for a dedicated child mailbox that it created:

```http
DELETE /management/v1/agents/{agent-id}
Authorization: Bearer hqb_agent_<provisioner-secret>
```

It cannot deprovision an existing human mailbox, a mailbox that was only shared with an agent, or
another provisioner's child. Repeating the request has the same successful result. The
deprovisioned child remains in `GET /management/v1/agents`, but it no longer counts as an active
provisioned mailbox.

Only a human owner or admin can restore a mailbox in this release. They can find deleted mailboxes
under **Settings → Mailboxes → Deleted mailboxes** and restore the same mailbox. Linked agents stay
disabled until an owner or admin separately reactivates them and receives a new credential.

## Technical details

People and machine agents are separate principals. People can have workspace roles. Machine agents
have no workspace role. A mailbox agent uses access to one exact mailbox. A provisioning key can
only provision mailboxes.

The signed-in Settings routes are:

```text
DELETE /api/mailboxes/{mailbox-id}
GET /api/mailboxes/deleted
POST /api/mailboxes/{mailbox-id}/restore
```

Only an owner or admin can use these routes. The first route soft-deletes the mailbox. The second
lists deleted mailboxes, and the third restores the same mailbox ID and messages.

The three connection roles are separate:

```text
Mailbox agent    → mailbox skill      → mailbox credential       → /api/v2
Provisioning key → provisioner skill  → provisioning credential  → /management/v1
Connected app    → human skill or MCP → human OAuth approval     → mail you can access
```

See [Mailbox access](/docs/access-control/) for access levels and the
[Mail API reference](/docs/specs/mail-api/) for the data-plane contract.
