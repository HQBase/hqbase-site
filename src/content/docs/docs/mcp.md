---
title: Connect AI agents
description: Connect an AI agent through MCP or HQBase's deployment-local Mail API instructions.
---

HQBase gives AI agents two connection choices. A compatible client can connect directly through
MCP, or a general-purpose agent can read the installation's generated `AGENTS.md` and use the
public Mail API. Both choices use OAuth and the same mailbox access rules as the web app.

The AI tool uses your existing HQBase account. It does not create another user or bypass your
mailbox access.

## Connect an AI agent

1. Open **Connect AI agent** in the HQBase sidebar or compact navigation.
2. Choose **MCP** or **AGENTS.md**.
3. For MCP, choose **Read-only** or **Mail actions** and copy the connection URL into your
   MCP-compatible client.
4. For AGENTS.md, copy the guide URL into an agent that can fetch web documentation and make HTTP
   requests.
5. The agent should display the short code and verification URL without opening a remote or cloud
   browser. Open the URL yourself in a browser you control, sign in to HQBase, confirm that the code
   and requested access match, and choose **Allow**.

Start with **Read-only** unless the AI tool genuinely needs to change or send mail. You can revoke
the connection later.

## Use AGENTS.md and the Mail API

Every installation serves a guide at `/AGENTS.md`, for example
`https://mail.example.com/AGENTS.md`. It contains that installation's exact API base URL, OAuth
discovery URLs, token audience, permissions, operating rules, and compact method index. It links to
the deployment-local OpenAPI document at `/api/v1/openapi.json` for exact parameters, request
bodies, and response schemas.

The guide is public and contains no token, account data, or mail content. Giving an agent the URL
does not grant access; the connected person must still sign in and approve OAuth access. A remote
`AGENTS.md` is an explicit instruction handoff rather than universal automatic discovery, so give
the agent the copied URL when it does not fetch the guide on its own.

For agents and command-line tools, the guide prefers OAuth Device Authorization. The agent requests
a short-lived code, displays the verification URL and short code without opening a cloud, remote,
automated, or agent-controlled browser, and waits while you approve in a browser you control. It
polls automatically and resumes after approval, so there is no callback URL, local browser listener,
or need to tell the agent to continue. The agent never receives your HQBase password or browser
session. HQBase still requires sign-in and an explicit permission decision, and the chat or agent
host may separately ask before it runs a command or contacts the installation.

Authorization Code with PKCE remains supported for clients that can safely receive a browser
callback, including compatible GUI clients and human API tools.

The Mail API covers mailboxes, messages, conversations, attachments, drafts, sending, and replying.
It does not manage people, mailbox access, domains, setup, updates, audits, sessions, notifications,
app secrets, or Cloudflare credentials.

## Choose what an MCP client can do

- **Read-only** uses `/mcp`. It can see the mailboxes you can access, search mail, open
  conversations and messages, and download attachments.
- **Mail actions** uses `/mcp/full`. It can also mark messages read, add stars, archive or trash
  mail, manage drafts and attachments, send new mail, reply, and forward.

Switching to **Mail actions** requires a new connection and approval. HQBase never quietly adds
abilities to an existing connection.

## Your mailbox access still applies

HQBase checks the selected profile, what you approved, and your current account and mailbox access
on every request. The most limited result wins.

For example, if Alex has Agent access to `support@example.com` but no access to
`billing@example.com`, Alex's AI tool can work with support mail only. Connecting the tool does not
make billing mail visible.

Changes take effect on the next request. This includes revoking the connection, changing mailbox
access, banning a user, changing a role, or ending a session. Owners keep Manager access to every
mailbox. Passwords and app secrets are never sent to the AI tool.

## Available tools

The Read-only profile provides:

- `list_mailboxes`
- `search_messages`
- `list_conversations`
- `get_message`
- `get_thread`
- `get_attachment`

The Mail actions profile also provides:

- `update_message` and `update_conversation`
- `list_drafts`, `get_draft`, `create_draft`, `update_draft`, and `delete_draft`
- `add_draft_attachment` and `remove_draft_attachment`
- `send_email`, `reply_to_message`, and `forward_message`

Draft version numbers prevent one edit from silently overwriting another. Replies and new messages
can contain plain text, optional HTML, and attachments previously added to the draft. Forwarding
can include the original attachments.

## Limits and privacy

- Each attachment transferred through MCP can be up to 10 MiB. HQBase's normal total attachment
  and recipient limits still apply.
- Search and list results are limited in size. MCP does not provide a live new-mail subscription;
  the AI tool must search or list conversations again.
- A mailbox you cannot access is completely absent, including its messages, drafts,
  conversations, and attachments.
- MCP cannot manage people, mailboxes, domains, setup, updates, audits, sessions, notifications,
  app secrets, or Cloudflare credentials.
- Logs and audit records never contain access tokens or email content.

## Technical details

HQBase supports Streamable HTTP and OAuth with discovery, dynamic client registration, Device
Authorization Grant, Authorization Code with PKCE, sign-in, and consent. The relevant OAuth
permissions are:

| Permission | What it allows |
| --- | --- |
| `mail:read` | List visible mailboxes and conversations, search and open mail, and download attachments. |
| `mail:write` | Mark mail read or unread, add or remove stars, archive mail, and move it to Trash. |
| `mail:send` | Manage drafts and attachments, send new mail, reply, and forward. |
| `offline_access` | Let a compatible tool request an optional refresh token. |

New clients start with `mail:read`. The `/mcp` and `/mcp/full` profiles are separate OAuth
connections, and a token works only with the profile that issued it. The
[versioned Mail API](/docs/specs/mail-api/) uses the same underlying mail services but has its own
OAuth resource, so an API token and an MCP token are not interchangeable.

Read actions are read-only. State and draft changes are safe to retry where applicable. Sending,
replying, and forwarding can send more than once if a client repeats the same request, so clients
must not retry them blindly. HQBase uses the same message validation, threading, attachment, and
sending rules as the web app, and records content-free audit events for successful changes.
