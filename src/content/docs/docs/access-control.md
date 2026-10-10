---
title: Mailbox access
description: Choose who can read, reply to, organize, and manage each shared mailbox.
---

People and machine agents only see mailboxes they have been given access to. Workspace owners can
use every mailbox so the workspace can always be recovered.

## Choose a mailbox access level

| Access level | Read mail | Send and reply | Organize mail | Set deletion rules |
| --- | --- | --- | --- | --- |
| None | No | No | No | No |
| Read | Yes | No | No | No |
| Handle mail | Yes | Yes | Yes | No |
| Manager | Yes | Yes | Yes | Yes |

- **Read** lets someone search, open, and download messages and attachments.
- **Handle mail** also lets them send and reply, mark messages read, add stars, archive messages,
  and move messages to Trash.
- **Manager** also lets them change mailbox settings and automatic deletion rules.

People with **Handle mail** or **Manager** access can use applicable shared signatures and add or
remove existing labels. Only a mailbox Manager can create or change that mailbox&apos;s signatures.
Workspace owners and admins manage domain signatures and workspace label definitions. These
configuration rights do not grant access to message content.

For example, a support teammate with **Handle mail** access to `support@example.com` can reply to
customers and organize that inbox. They cannot see `billing@example.com` unless you give them
access to it, and they cannot change how long support mail is kept unless you make them a
**Manager**.

## Machine agents

A machine agent has no login account or workspace role. It gets **Read** or **Handle mail** access
to the one mailbox selected during creation. Read access includes every current and future message
and attachment in that mailbox. Create a separate mailbox agent for another mailbox.

A provisioner's own credential works only with the separate Management API. It receives the
one-time credentials for the mailbox agents that it creates, so treat it as a trusted credential
issuer. It can list these agents and replace their credentials, but it cannot manage other agents.
Machine agents cannot access unassigned catch-all mail.

See [Agent mailboxes](/docs/agent-mailboxes/) for creation, credentials, and safe disablement.

Messages are kept indefinitely by default. Messages in Trash are deleted after 30 days.

## Workspace roles

Workspace roles control administration. Mailbox access controls email. They are separate:

- **Owner** is the recovery account and has Manager access to every mailbox. Only an owner can make
  another owner.
- **Admin** can manage people, system settings, agents, and mailbox access. An admin can give
  themselves access to any mailbox, but cannot manage owners or access unassigned catch-all mail.
- **Member** can use only the mailboxes you assign to them.

Owners and admins can see the list of mailboxes so they can manage access, but that list does not
reveal messages or attachments.

An owner can view and end any person's sessions. An admin can view and end sessions for admins and
members, but never for owners. A member can manage only their own sessions.

Owners and admins can soft-delete and restore mailboxes. Mailbox agents cannot do either. A
provisioner can deprovision only a dedicated child mailbox that it created; it cannot deprovision
an existing human mailbox or another provisioner's mailbox.

## Unassigned catch-all mail

When a domain keeps unmatched mail for owner review, that mail is unassigned. It belongs to no
mailbox, so only a workspace owner can read it, organize it, download its attachments, or receive
a notification for it. Admins, members, and machine agents cannot access unassigned mail.

When a domain instead delivers unmatched mail to a catch-all mailbox, the message uses that
mailbox's normal access rules. People and machine agents with access to the mailbox can use the
message according to their grant. The exact unmatched recipient remains visible, but it does not
become a sending identity.

HQBase keeps this rule when an owner archives or trashes the message. Historical mail from a
mailbox that was later deleted does not become unassigned catch-all mail. New mail to that
mailbox's inactive address follows the domain's normal unmatched-mail policy.

## Login accounts and shared mailboxes are separate

Every person signs in with a unique login email. That address is used for invitations, sign-in, and
account recovery; it does not become a shared mailbox and does not give access to a matching
mailbox.

The login must remain available when HQBase is offline, so it cannot use a domain connected to this
workspace. If your shared mailboxes use `example.com`, use a login on another domain. HQBase also
blocks you from connecting a new domain if an existing person's login already uses it.

If a person forgets their password, they can select **Forgot password?** on the sign-in page and
enter their Login email. HQBase shows the same confirmation for every request, so it does not reveal
whether an account exists, an email delivery state, or a reset link. A valid link works once,
expires after seven days, and ends the person's existing sessions when the password changes.
Requesting a new link makes every older unused password link for that account stop working.

A valid reset link opens `/reset-password`, and an invitation opens `/set-password`. Both work
without a session. Invalid, expired, and used links show a specific recovery action instead of
password fields. New passwords use 8 to 128 characters and require confirmation. After recovery,
a safe same-origin return path lets a pending sign-in resume; untrusted external return addresses
are ignored.

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

## Remove and restore people

Owners and admins can remove a member or admin from **Settings → People**. Only an owner can remove
another owner. You cannot remove your own account or the last active owner.

Removal takes effect immediately. HQBase ends the person's sessions, revokes connected-app access,
cancels pending sign-in setup, stops notifications, and removes all mailbox access. Existing mail,
drafts, contacts, signatures, and audit history stay in the workspace. The person appears as
**Removed** in the People table and cannot sign in.

An owner or admin can restore a removed member or admin. Only an owner can restore another owner.
The restored person signs in again with the same login identity. Sessions, connected apps,
notifications, and mailbox access do not return. Assign mailbox access again when it is needed. A
pending person also needs a new invitation or temporary password from the row's actions menu.

## How access is enforced

The same mailbox access level applies in the web app, APIs, and MCP connections. An AI tool cannot
see or change mail that its connected user cannot access. A machine credential cannot exceed its
agent's assigned mailbox access. You can give an MCP connection fewer abilities, but never more.

Access changes take effect on the next request. With no mailbox access, messages, attachments,
sender identities, exports, and mailbox contents do not appear. Owners and admins can still see
mailbox metadata that they need to manage access. Unassigned mail appears only to owners.

HQBase records who performs sensitive actions such as changing access, deleting data, recovering
an account, or managing sessions. These audit records do not contain email content, passwords,
password hashes, reset tokens, or invitation links.

## Technical details

The public **Handle mail** level uses the internal value `agent`. The other internal access values
are `read` and `manager`. New people, new machine agents, and new mailbox access are always denied
until explicitly assigned. Existing users created before onboarding tracking was introduced remain
active during upgrades. Pre-launch schema consolidation does not keep old edition-migration
compatibility code.
