---
title: Connect an AI tool
description: Let an AI tool act on mail available to your signed-in HQBase account.
---

This page is for an AI tool that acts for a signed-in person. It does not create a machine identity
or a dedicated mailbox. To give an automated service its own credential, see
[Agent mailboxes](/docs/agent-mailboxes/).

Open **Settings → Connect AI agents → Your account**. The other tab, **Agentic mailbox**, is for
machine identities. Under **Your account**, choose one of two methods:

| Method | Use it when |
| --- | --- |
| **MCP** | Your AI client supports a remote MCP server. |
| **Agent Skill** | Your agent can install a skill and make HTTP requests. |

Both methods use your existing HQBase account and need your OAuth approval. They do not create
another user or bypass your mailbox access. Machine agent credentials do not work with either
method.

## Connect with MCP

MCP is the simplest choice for clients that support remote MCP servers.

### How to connect

1. Open **Settings → Connect AI agents**.
2. Select **Your account**.
3. Choose **Read-only** or **Mail actions**.
4. Copy the connection URL.
5. Add the URL to your MCP client.
6. Follow the short-code verification link that the client displays.
7. Sign in to HQBase, check the requested access, and select **Allow**.

Start with **Read-only**. Use **Mail actions** only when the agent must change or send mail.

### Choose an MCP profile

HQBase provides two separate MCP profiles.

| Profile | URL | What it can do |
| --- | --- | --- |
| **Read-only** | `/mcp` | List accessible mailboxes, search mail, open messages and conversations, and download attachments. |
| **Mail actions** | `/mcp/full` | Do everything in Read-only, organize mail, manage drafts and attachments, send mail, reply, and forward. |

Each profile is a separate OAuth connection. Changing from **Read-only** to **Mail actions** needs a
new connection and approval.

### Available MCP tools

The **Read-only** profile provides:

- `list_mailboxes`
- `search_messages`
- `list_conversations`
- `get_message`
- `get_thread`
- `get_attachment`

The **Mail actions** profile also provides:

- `update_message` and `update_conversation`
- `list_drafts`, `get_draft`, `create_draft`, `update_draft`, and `delete_draft`
- `add_draft_attachment` and `remove_draft_attachment`
- `send_email`, `reply_to_message`, and `forward_message`

### MCP technical details

- **Transport:** Streamable HTTP.
- **Authentication:** OAuth with discovery and dynamic client registration.
- **Authorization:** Device Authorization Grant or Authorization Code with PKCE.
- **Device flow:** It needs no callback URL. The client polls automatically and resumes after you
  approve the connection.
- **Token boundary:** `/mcp` and `/mcp/full` issue tokens for different OAuth resources. A token for
  one profile does not work with the other profile or the Mail API.
- **Attachments:** Each attachment transferred through MCP can be up to 10 MiB. Normal HQBase
  recipient and total attachment limits still apply.
- **Refresh:** MCP does not provide a live new-mail subscription. The client must search or list
  conversations again.
- **Retries:** A repeated send, reply, or forward request can send mail more than once. Clients must
  not retry these requests without checking the result.

MCP uses these OAuth permissions:

| Permission | What it allows |
| --- | --- |
| `mail:read` | List visible mailboxes and conversations, search and open mail, and download attachments. |
| `mail:write` | Mark mail read or unread, add or remove stars, archive mail, and move it to Trash. |
| `mail:send` | Manage drafts and attachments, send new mail, reply, and forward. |
| `offline_access` | Let a compatible client request an optional refresh token. |

## Connect via SKILL.md

### How SKILL.md uses the Mail API

Use the human-delegated skill when the agent can make HTTP requests but cannot connect to MCP:

```text
https://mail.example.com/skills/hqbase-mail/SKILL.md
```

In **Settings → Connect AI agents → Your account**, copy the skill URL or download the file and
give it to the agent. The agent uses `/api/v1`, displays a short-code verification link, and waits
while you sign in and approve access. The public skill contains no credential or mail content.
It links to the installation's exact OpenAPI document at `/api/v1/openapi.json`.

The agent must not open the verification link in a remote or agent-controlled browser. See the
[Mail API reference](/docs/specs/mail-api/) for the exact OAuth and API contract.

## Access rules for both methods

HQBase checks three limits on every request:

1. The selected MCP profile or Mail API operation.
2. The OAuth permissions that you approved.
3. Your current HQBase role and mailbox access.

The most limited result wins. For example, an agent can work with `support@example.com` only if the
connected person can also access that mailbox.

Access changes apply to the next request. This includes a revoked connection, changed mailbox
access, banned user, changed role, or ended session. HQBase never sends passwords, app secrets, or
browser session cookies to the AI agent. Logs and audit records do not contain access tokens or
email content.
