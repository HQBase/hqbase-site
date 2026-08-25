---
title: Contacts and labels
description: How HQBase finds correspondents, keeps private contact notes, and organizes conversations with shared labels.
---

HQBase helps people and mail agents reuse known addresses and organize mail without sending contact
data outside the customer&apos;s installation.

## Contacts

Contacts are personal to one signed-in person. A contact contains one normalized email address, an
optional display name, and private notes. Two people can save different names or notes for the same
address. Contact notes never appear to another workspace user, a mailbox agent, or an email
recipient.

The **Contacts** destination sits beside **Mail** and **Settings** in primary navigation. The page
lists saved contacts and correspondents found in mail that the current person can access. It supports
search, create, edit, and delete actions. Removing a saved contact removes its saved name and notes;
the address can still appear as a recent correspondent while an accessible exchange exists.

Opening a contact shows:

- the saved name and exact email address;
- editable private notes;
- every accessible conversation with that address, loaded in stable pages; and
- a **New email** action that opens the normal composer with the address in **To**.

The exchange list uses exact sender and recipient matching. A person can load older pages until all
accessible exchanges are visible. It never reveals a conversation from a mailbox the person cannot
currently read. Losing mailbox access removes those exchanges on the next request.

### Recipient suggestions

The **To**, **Cc**, and **Bcc** fields suggest contacts while the person types. Suggestions combine:

1. saved contacts;
2. recent senders and recipients from accessible mail; and
3. the person&apos;s available mailbox addresses when applicable.

Prefix matches on a saved name or email address appear first, followed by other literal matches and
recent exchanges. Each row shows the display name, address, and why it is known. Keyboard users can
move through the list, select a result, close it with Escape, and continue entering more recipients.

Typing does not show an invalid-address error. HQBase validates completed recipients when the field
loses focus and again before saving or sending. A selected suggestion inserts one normalized address
and does not send anything.

### Contact storage and privacy

Saved contact records belong to a workspace user and stay in D1. HQBase derives recent
correspondents from accessible message metadata; it does not copy message bodies into contacts.
Names and notes do not enter logs, analytics, push notifications, or Cloudflare configuration.

## Labels

Labels are shared workspace organization. A label has a unique case-insensitive name and one
workspace color token from the supported product palette. Owners and admins can create, rename,
recolor, and delete labels in **Settings → Labels**. Deleting a label removes its assignments but
does not delete or move mail.

A person or machine agent with **Handle mail** or **Manager** access can add or remove an existing
label on mail they can organize. **Read** access can see labels but cannot change them. A label never
grants mailbox access and never makes an inaccessible message visible.

HQBase applies labels to messages. A conversation row shows the union of labels on its accessible
messages. A conversation-level action adds or removes the label from every message in that
conversation that the actor can organize. It does not change inaccessible copies.

Every mail folder supports one optional label filter. The filter combines with the active folder,
mailbox, and literal search filters. A conversation matches when at least one accessible message in
that conversation has the selected label. Changing the label filter returns to the newest page and
does not change the underlying folder.

### Human controls

Conversation rows and the conversation reader have a one-click **Labels** action. Its menu lists
current labels with checked state, applies a choice immediately, and reports success or failure.
The same menu can remove a label. Compact layouts use full touch targets without hiding the sender,
subject, snippet, time, or star action.

**Settings → Labels** uses compact rows and normal-size dropdowns. Add and edit actions use a
labelled dialog. No large button size is used. The mailbox selector in the app header remains the
only extra-compact dropdown.

### Mail API and agents

Both stable Mail API versions support labels without changing existing clients:

- `GET /labels` lists labels visible to the caller.
- `PUT /messages/{id}/labels/{labelId}` and the matching `DELETE` add or remove one label.
- `PUT /conversations/{id}/labels/{labelId}` and the matching `DELETE` apply the change to every
  accessible message that the caller can organize.
- `labelId` is an optional filter on message and conversation list requests.

Session-authenticated `/api/labels` management routes let an owner or admin create, update, and
delete label definitions. Machine credentials cannot change workspace label definitions. A label
definition change sends a wake-only `labels` event so connected clients refresh the authoritative
label list and visible mail.

The MCP server exposes `list_labels`, `add_label`, and `remove_label`. Tool descriptions state that
labels organize mail but never change mailbox access or message folders. Label changes use the same
mailbox checks as the web app and Mail API.

## Errors and accessibility

Contact and label controls use persistent labels, visible focus, keyboard navigation, and status
messages. Compact targets are at least 44 by 44 CSS pixels where practical.

Stable label errors are `LABEL_NOT_FOUND`, `LABEL_FORBIDDEN`, `LABEL_NAME_CONFLICT`, and
`LABEL_INVALID`. Stable contact errors are `CONTACT_NOT_FOUND` and `CONTACT_INVALID`. Error
responses never contain contact notes or email content.
