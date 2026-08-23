---
title: Connect AI agents
description: Connect an AI agent through MCP or install HQBase's deployment-local SKILL.md.
---

HQBase supports two ways to connect an AI agent.

| Method | Use it when |
| --- | --- |
| **MCP** | Your AI client supports a remote MCP server. |
| **SKILL.md** | Your agent can install a skill and make HTTP API requests. |

Both methods use your existing HQBase account. They do not create another user or bypass your
mailbox access.

## Connect with MCP

MCP is the simplest choice for clients that support remote MCP servers.

### How to connect

1. Open **Connect AI agent** in the HQBase sidebar or compact navigation.
2. Select **MCP**.
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

Each `list_mailboxes` item has one `address` and its `mailDomainId`. It does not have an
`addresses` list because each email address is a separate mailbox.

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

`SKILL.md` is for agents that can install instructions and make HTTP requests. The skill does not
use MCP. It uses the HQBase Mail API at `/api/v2`.

### How to connect

1. Open **Connect AI agent** in the HQBase sidebar or compact navigation.
2. Select **Agent Skill**.
3. Select **Copy URL** or **Download Skill**.
4. Give the URL or downloaded `SKILL.md` file to your agent.
5. Let the agent read the skill and the linked OpenAPI document.
6. Open the verification link that the agent displays.
7. Sign in to HQBase, check the requested access, and select **Allow**.

The agent must display the verification link and short code. It must not open the link in a remote,
automated, or agent-controlled browser.

### How SKILL.md uses the Mail API

Every HQBase installation publishes its skill at:

```text
https://mail.example.com/skills/hqbase-mail/SKILL.md
```

The skill contains:

- The required skill name and description.
- The installation's Mail API and OAuth URLs.
- The available OAuth permissions.
- Safety and retry rules.
- A compact list of Mail API methods.
- A link to the installation's OpenAPI document at `/api/v2/openapi.json`.

The Mail API supports mailboxes, messages, conversations, attachments, drafts, sending, and
replying. It does not manage people, mailbox access, domains, setup, updates, sessions, app secrets,
or Cloudflare credentials.

See the [Mail API reference](/docs/specs/mail-api/) for authentication, endpoints, request formats,
errors, and versioning rules.

### SKILL.md technical details

- The skill file is public. It contains no token, account data, or mail content.
- Giving an agent the skill does not grant access. The person must still approve OAuth access.
- Device Authorization Grant is the preferred flow for agents and command-line tools.
- Authorization Code with PKCE is available for clients that can safely receive a browser callback.
- Mail API tokens use the `/api/v2` OAuth resource. They do not work with `/mcp` or `/mcp/full`.
- The old `/AGENTS.md` and `/agents.md` URLs redirect to the current `SKILL.md` URL.

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
