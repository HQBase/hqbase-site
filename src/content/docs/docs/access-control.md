---
title: Mailbox access
description: Choose who can read, reply to, organize, and manage each shared mailbox.
---

People only see mailboxes they have been given access to. Workspace owners can use every mailbox so
the workspace can always be recovered.

## Choose a mailbox access level

| Access level | Read mail | Send and reply | Organize mail | Set deletion rules |
| --- | --- | --- | --- | --- |
| None | No | No | No | No |
| Read | Yes | No | No | No |
| Agent | Yes | Yes | Yes | No |
| Manager | Yes | Yes | Yes | Yes |

- **Read** lets someone search, open, and download messages and attachments.
- **Agent** also lets them send and reply, mark messages read, add stars, archive messages, and move
  messages to Trash.
- **Manager** also lets them change mailbox settings and automatic deletion rules.

For example, a support teammate with **Agent** access to `support@example.com` can reply to
customers and organize that inbox. They cannot see `billing@example.com` unless you give them
access to it, and they cannot change how long support mail is kept unless you make them a
**Manager**.

Messages are kept indefinitely by default. Messages in Trash are deleted after 30 days.

## Workspace roles

Workspace roles control administration. Mailbox access controls email. They are separate:

- **Owner** is the recovery account and has Manager access to every mailbox. Only an owner can make
  another owner.
- **Admin** can manage people, system settings, and mailbox access. An admin still cannot read a
  mailbox unless you give them access to it.
- **Member** can use only the mailboxes you assign to them.

Owners and admins can see the list of mailboxes so they can manage access, but that list does not
reveal messages or attachments.

## Login accounts and shared mailboxes are separate

Every person signs in with a unique login email. That address is used for invitations, sign-in, and
account recovery; it does not become a shared mailbox and does not give access to a matching
mailbox.

The login must remain available when HQBase is offline, so it cannot use a domain connected to this
workspace. If your shared mailboxes use `example.com`, use a login on another domain. HQBase also
blocks you from connecting a new domain if an existing person's login already uses it.

## Add people

Owners and admins can add someone in either of these ways:

- **Send an invitation.** The link works once and expires after seven days. Sending a new invitation
  makes every older unused link stop working.
- **Create the person directly.** HQBase shows a temporary password once. Share it through a secure
  channel; HQBase stores only a protected version of the password.

Invited people choose a password before signing in. People created directly can sign in with the
temporary password only to replace it. Until that step is complete, they cannot use the workspace
or connect an AI tool. Afterward, you still need to choose which mailboxes they can use.

If an invitation expires, resend it. If a temporary password is lost while setup is still pending,
generate a new one. Admins can see setup status, but never a password or invitation link.

## How access is enforced

The same mailbox access level applies in the web app, APIs, and MCP connections. An AI tool cannot
see or change mail that its connected user cannot access. You can give an MCP connection fewer
abilities, but never more.

Access changes take effect on the person's next request. With no mailbox access, messages,
attachments, sender identities, exports, and mailbox details do not appear at all.

HQBase records who performs sensitive actions such as changing access, deleting data, recovering
an account, or managing sessions. These audit records do not contain email content, passwords,
password hashes, reset tokens, or invitation links.

## Technical details

The internal access values are `read`, `agent`, and `manager`. New users and new mailbox access are
always denied until explicitly assigned. Existing users created before onboarding tracking was
introduced remain active during upgrades. Pre-launch schema consolidation does not keep old
edition-migration compatibility code.
