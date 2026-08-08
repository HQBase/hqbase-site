---
title: Connect AI tools with MCP
description: Connect a compatible AI tool and choose what it can do with your mail.
---

MCP is a standard that lets an AI tool work with other products. In HQBase, an MCP connection can
search and read mail and, if you allow it, organize, draft, and send mail.

The AI tool uses your existing HQBase account. It does not create another user or bypass your
mailbox access.

## Connect an AI tool

1. Open **Connect MCP** in the HQBase sidebar or compact navigation.
2. Choose **Read-only** or **Mail actions**.
3. Copy the connection URL into your MCP-compatible AI tool.
4. Sign in to HQBase and approve the connection.

Start with **Read-only** unless the AI tool genuinely needs to change or send mail. You can revoke
the connection later.

## Choose what the AI tool can do

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

HQBase supports Streamable HTTP and OAuth with discovery, dynamic client registration, the
authorization-code flow with PKCE, sign-in, and consent. The relevant OAuth permissions are:

| Permission | What it allows |
| --- | --- |
| `mail:read` | List visible mailboxes and conversations, search and open mail, and download attachments. |
| `mail:write` | Mark mail read or unread, add or remove stars, archive mail, and move it to Trash. |
| `mail:send` | Manage drafts and attachments, send new mail, reply, and forward. |
| `offline_access` | Let a compatible tool request an optional refresh token. |

New clients start with `mail:read`. The `/mcp` and `/mcp/full` profiles are separate OAuth
connections, and a token works only with the profile that issued it.

Read actions are read-only. State and draft changes are safe to retry where applicable. Sending,
replying, and forwarding can send more than once if a client repeats the same request, so clients
must not retry them blindly. HQBase uses the same message validation, threading, attachment, and
sending rules as the web app, and records content-free audit events for successful changes.
