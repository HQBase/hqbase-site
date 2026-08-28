---
title: Connect an AI tool
description: Let an AI tool act on mail available to your signed-in HQBase account.
---

For an AI assistant that acts through your account, HQBase supports two connection methods.

| Method | Use it when |
| --- | --- |
| **MCP** | Your AI client supports a remote MCP server. |
| **SKILL.md** | Your agent can install instructions and make HTTP requests. |

Both methods use your existing HQBase account and need your OAuth approval. They do not create
another user or bypass your mailbox access. Machine identities use a separate credential and are
described below.

## Connect with MCP

MCP connects an AI tool to HQBase through a remote MCP server.

### How to connect

1. Open **Agents** in the HQBase sidebar or compact navigation.
2. Select **Add connection**, then **AI assistant**.
3. Keep **Mail actions**, or choose **Read only** when the client only needs to search and read.
4. Copy the connection URL.
5. Add the URL to your MCP client.
6. Follow the short-code verification link that the client displays.
7. Sign in to HQBase, check the requested access, and select **Allow**.

**Mail actions** is selected by default for complete email workflows. Choose **Read-only** when the
client must not change or send mail.

### Choose an MCP profile

HQBase provides two separate MCP profiles.

| Profile | URL | What it can do |
| --- | --- | --- |
| **Mail actions** | `/mcp/full` | Do everything in Read-only, organize mail, manage drafts and attachments, send mail, reply, and forward. |
| **Read-only** | `/mcp` | List accessible mailboxes, search mail, open messages and conversations, and download attachments. |

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
  recipient and total attachment limits still apply. `add_draft_attachment` accepts `inline: true`
  for a supported image and then returns its private `htmlSrc`. Use that exact source in the draft's
  HTML through `update_draft`; do not construct it.
- **Signatures:** `create_draft`, `send_email`, `reply_to_message`, and `forward_message` use the
  applicable default signature when `signature` is omitted. Use `signature: { mode: "none" }` when
  the message must have no signature. An update that omits `signature` keeps the draft's current
  choice.
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

1. Open **Agents** in the HQBase sidebar or compact navigation.
2. Select **Add connection**, then **AI assistant**.
3. Open **Use the Mail API skill instead**.
4. Select **Copy URL** or **Download Skill**.
5. Give the URL or downloaded `SKILL.md` file to your agent.
6. Let the agent read the skill and the linked OpenAPI document.
7. Open the verification link that the agent displays.
8. Sign in to HQBase, check the requested access, and select **Allow**.

The agent must display the verification link and short code. It must not open the link in a remote,
automated, or agent-controlled browser.

### How SKILL.md uses the Mail API

The connection dialog shows the human-delegated skill:

```text
https://mail.example.com/skills/hqbase-mail/SKILL.md
```

The agent uses `/api/v2`, displays a short-code verification link, and waits while you sign in and
approve access. The public skill contains no credential or mail content. It links to the
installation's exact OpenAPI document at `/api/v2/openapi.json`.

The agent must not open the verification link in a remote or agent-controlled browser. See the
[Mail API reference](/docs/specs/mail-api/) for the exact OAuth and API contract.

## Connect a machine identity

Owners and admins can create software identities that do not act through a person's OAuth access.

| Identity | Use it when |
| --- | --- |
| **Mailbox agent** | Software needs its own identity and access to one exact mailbox. |
| **Provisioning key** | A trusted control-plane service must create and deprovision mailbox agents on one approved domain. |

### First-time setup

1. Open **Agents** and select **Add connection**.
2. Select **Automation with its own mailbox** or **Provisioning key**.
3. Enter the identity's limits and select **Create**.
4. Copy the one-time credential and the public skill URL before closing the dialog.
5. Give both values to the software through a secure channel.

The public skill explains which API the credential can use. The credential is secret. HQBase stores
only its hash and cannot show it again.

### Return to setup instructions

Open the identity's row menu and select **Setup instructions**. HQBase shows the same public skill
URL and a short setup recap. Use the credential that you saved when the identity was created. If it
was lost, select **Rotate credential** for an enabled identity. Rotation stops the old credential
immediately and reveals a new one once. For a disabled identity, select **Enable** to reveal a fresh
credential once. Restore a deleted mailbox before you enable its identity.

An OAuth connection shows **Authorized** while its consent exists. A machine identity shows
**Enabled** when its credential can authenticate, **Disabled** after it is disabled, or **Mailbox
deleted** when its mailbox must be restored. **Enabled** does not mean that the software is online.

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

## Review or revoke a connection

Open **Agents**. The **Connections** list includes only the OAuth clients approved by the signed-in
person. It shows the client name, approved access, and connection method. It does not show another
workspace member's connections.

Select **Revoke** to remove the complete person-client connection. HQBase removes its consent and
invalidates all access tokens and refresh-token families for that person and client in one
operation. The client fails on its next request. This does not disable a mailbox agent, revoke
another person's connection, or end the person's browser session.
