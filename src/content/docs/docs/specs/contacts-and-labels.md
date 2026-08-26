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
lists saved external contacts and external recipients from accessible outbound mail. A successful
send can add addresses from **To**, **Cc**, and **Bcc** as recent contacts. Receiving a message does
not add its sender, and recipients on inbound messages do not become contacts. Current workspace
mailbox addresses never appear in Contacts, including after a person sends mail to one of them.

The page supports search, create, edit, and delete actions. Its directory and exchange rows use the
same list surface, spacing, hover color, and focus treatment as conversation rows. Removing a saved
contact removes its saved name and notes. The address can still appear as a recent contact when it
is an accessible outbound recipient.

Opening a contact shows:

- the saved name and exact email address;
- editable private notes;
- every accessible conversation with that address, loaded in stable pages; and
- a **New email** action that opens the normal composer with the address in **To**.

The exchange list uses exact sender and recipient matching. A person can load older pages until all
accessible exchanges are visible. It never reveals a conversation from a mailbox the person cannot
currently read. Losing mailbox access removes those exchanges on the next request.

### Recipient suggestions

The **To**, **Cc**, and **Bcc** fields suggest addresses while the person types. Suggestions combine:

1. saved contacts;
2. recent **To**, **Cc**, and **Bcc** recipients from accessible outbound mail; and
3. the person&apos;s available mailbox addresses as separate **Mailbox** suggestions.

An address found only in an inbound **From**, **To**, **Cc**, or **Bcc** field is not a contact or a
recent suggestion. Available mailbox addresses can appear in the composer, but they never appear in
the Contacts directory.

Prefix matches on a saved name or email address appear first, followed by other literal matches and
recent exchanges. Each row shows the display name, address, and why it is known. Keyboard users can
move through the list, select a result, close it with Escape, and continue entering more recipients.

Typing does not show an invalid-address error. HQBase validates completed recipients when the field
loses focus and again before saving or sending. A selected suggestion inserts one normalized address
and does not send anything.

### Contact storage and privacy

Saved contact records belong to a workspace user and stay in D1. HQBase derives recent contacts
only from **To**, **Cc**, and **Bcc** metadata on accessible outbound messages. It does not copy
message bodies into contacts.

HQBase stores a decoded sender display name as message metadata when an inbound message provides
one. This observed name does not create or save a contact. For an address that is already saved or
eligible as a recent outbound recipient, the latest accessible observed name can appear as a
fallback. A private saved name always takes priority. Clearing a private name does not copy the
observed name into the saved contact.

Names and notes do not enter logs, analytics, push notifications, or Cloudflare configuration.
HQBase does not retrieve personal profile photos from Gmail, Gravatar, or another remote directory.
Contact avatars use initials until a separate, explicit photo source is supported.

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

Every mail folder supports an optional set of label filters. The filters combine with the active
folder, mailbox, and literal search filters. A conversation matches when its accessible messages
contain every selected label. Selecting no labels shows all labels. Changing the label filters
returns to the newest page and does not change the underlying folder.

### Human controls

Conversation rows and the conversation reader have a one-click **Labels** action. The folder
toolbar uses the normal label icon. At every reader width, the current labels form one control
in the final message header. On desktop, put the control directly before the date. On compact
layouts, put it to the right of the recipient line and put the date below it. The control keeps the
current desktop pill size on compact and desktop layouts, always shows the normal label icon, and
uses a very light gray surface. A person with
Handle or Manager access can open that control and change the assignments. Read access shows the
same control without an edit action. Align the reader control to the trailing edge, with its icon at
the leading edge and clear space before the label pills. When no label is assigned, the editable
control says **Add label** and uses a light dashed border. Labels do not appear in **More actions**.
On desktop, the row
shows up to three named pills over the trailing edge of the preview, then stacks the remaining
labels so their colors stay visible. The fully rounded container uses the current conversation-row
surface, including its hover or selected state, two CSS pixels of outer padding, and a solid shadow
in the same color. The shadow
extends past the container edge so preview text cannot show through. It has no blur or border. Its
trailing edge stays fixed so the desktop label icons align between rows. The complete container is
the Labels button, and selecting any visible part opens the assignment menu. The label icon has no
separate button background. Hovering the container changes only the icon color. Each
named pill uses a translucent label-color background with darker color-matched text in light mode
and lighter color-matched text in dark mode. It reserves at least a four-letter width and shows at
least nine characters, including **Important**, before truncation.
The action menu lists current labels with checked state, applies a choice immediately, and reports
success or failure. While the request runs, the control keeps its normal opacity and shows the new
assignment immediately. If the request fails, it restores the previous assignment. The same menu
can remove a label. Compact layouts show every assigned label in
one non-wrapping, read-only row at the bottom trailing edge of the message preview, separate from the
star. The trailing edge stays aligned with the preview boundary. If the group is wider than the
preview, it extends to the left instead of clipping labels. A compact row does not show the label
action; a person opens the conversation to change its labels.

The folder toolbar uses a small-text compact checkbox multiselect instead of a standard field
dropdown. Its trigger shows selected label names and colors, not only their count. On desktop, its
trailing edge aligns with the row Labels buttons at the trailing edge of the preview. A person can
add or remove more than one active filter without closing the menu after each choice.

**Settings → Labels** uses compact rows and normal-size dropdowns. Add and edit actions use a
labelled dialog. No large button size is used. The mailbox selector in the app header remains the
only extra-compact dropdown.

### Mail API and agents

Both stable Mail API versions support labels without changing existing clients:

- `GET /labels` lists labels visible to the caller.
- `PUT /messages/{id}/labels/{labelId}` and the matching `DELETE` add or remove one label.
- `PUT /conversations/{id}/labels/{labelId}` and the matching `DELETE` apply the change to every
  accessible message that the caller can organize.
- Repeating `labelIds` is an optional filter on message and conversation list requests. A result
  must contain every requested label. The existing single `labelId` parameter keeps its behavior
  and can be combined with `labelIds`.

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
