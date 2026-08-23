---
title: Agent mailboxes
description: Give a machine agent its own email address and only the mailbox access it needs.
---

An agent mailbox gives an automated service direct access to one HQBase mailbox without creating a
person account. Use an existing mailbox or create a dedicated address. The agent identity, mailbox,
messages, and stored credential record stay in your Cloudflare account. You choose where the agent
itself runs.

Dedicated agent mailboxes appear in the header under **Agent mailboxes**. An existing mailbox keeps
its normal position when you also give an agent access to it.

## Choose an agent type

An owner or admin creates the first agent in **Settings → Agents**.

| Agent type | What it does |
| --- | --- |
| **Mailbox agent** | Reads or acts on mail in one exact mailbox. |
| **Provisioner agent** | Creates mailbox agents and mailboxes through the Management API. Its own credential cannot call the Mail API. |

HQBase shows the new bearer credential once. After Settings creates, rotates, or reactivates a
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

Use the mailbox agent credential as a bearer token with the existing Mail API at `/api/v1`. The
same message, conversation, attachment, draft, send, reply, and forward endpoints used by other
clients apply the agent's current mailbox access on every request.

Give the agent the mailbox skill shown after credential creation:

```text
https://mail.example.com/skills/hqbase-mailbox/SKILL.md
```

You can copy the public skill URL again from **Settings → Connect AI agents → Agentic mailbox**.
It is in the **Mailbox agent** section. The skill contains no credential or mail content.

Drafts remain private to the identity that created them. A person cannot open a machine agent's
draft, even when both can use the same mailbox.

The authenticated WebSocket at `/api/v1/events` can wake the agent when a synchronization feed may
have new work. A wake-up contains only a topic, not mail content or message identifiers. The agent
then reads the authoritative changes from the Mail API. It can poll the same feeds if the socket is
not available.

MCP remains a connection for an AI tool that acts for a signed-in person. A machine agent
credential does not work with `/mcp` or `/mcp/full`. See [Connect an AI tool](/docs/mcp/) for that
separate workflow.

## Let a provisioner create mailboxes

A provisioner uses its bearer credential with `/management/v1`. It can create a mailbox, its first
address, a mailbox agent, and an explicit mailbox grant on a domain that is already connected to
HQBase. It cannot connect a domain or use its Management API credential with the Mail API.

Give the provisioner its separate skill:

```text
https://mail.example.com/skills/hqbase-provisioner/SKILL.md
```

The **Provisioner agent** section under **Settings → Connect AI agents → Agentic mailbox** shows
this URL. Do not give a provisioner the mailbox skill.

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

If the response is lost, do not create the address again. Use `GET /management/v1/agents` to find
the mailbox agents created by this provisioner. Then use
`POST /management/v1/agents/{agent-id}/credential` to create a replacement credential. The old
credential stops working. A provisioner cannot list or replace credentials for other agents.

The provisioner's own credential cannot call the Mail API. However, the provisioner receives each
new mailbox agent credential, so it can delegate or retain that mailbox access. Run it as a trusted
control-plane service. Do not use an untrusted mail-processing agent as the provisioner.

## Disable an agent safely

Disabling any agent stops its credentials from authorizing new requests. For a mailbox agent,
HQBase keeps the mailbox, address, messages, and audit history. Mail sent to the address still
belongs to that mailbox; it never becomes unassigned catch-all mail. Disabling a provisioner stops
new provisioning but does not disable the mailbox agents that it already created.

## Technical details

People and machine agents are separate principals. People can have workspace roles. Machine agents
have no workspace role. A mailbox agent uses one explicit mailbox grant. A provisioner uses only
its provisioning capability.

The three connection roles are separate:

```text
Mailbox agent  → mailbox skill      → mailbox credential     → /api/v1
Provisioner    → provisioner skill  → provisioner credential → /management/v1
Your account   → human skill or MCP → human OAuth approval   → mail you can access
```

See [Mailbox access](/docs/access-control/) for access levels and the
[Mail API reference](/docs/specs/mail-api/) for the data-plane contract.
