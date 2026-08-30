---
title: Writing and sending mail
description: How HQBase saves drafts, chooses a From address, handles attachments, and sends replies and forwards.
---

HQBase uses the same composer for new messages, replies, and forwards. Drafts save automatically,
remain private to their author, and are checked again before anything is sent.

## At a glance

| When you… | HQBase… |
| --- | --- |
| Start a new message | Uses your default sending mailbox and saves a private draft. |
| Reply | Replies to the exact message you selected and prefers the mailbox that received it. |
| Forward | Starts with your default sending mailbox and adds the selected message as context. |
| Add a file | Uploads it to your installation and keeps it attached to that draft only. |
| Insert an image | Keeps it private, places it at the cursor, and sends it inside the message. |
| Send | Rechecks mailbox access, the From address, and the domain before delivering anything. |

## Drafts are private and automatic

Only the person who created a draft can see or edit it. HQBase does not provide shared,
collaborative drafts.

A draft keeps:

- its mailbox and exact From address;
- To, Cc, and Bcc recipients;
- the subject, formatted content, and plain-text version;
- reply or forward context;
- attachments;
- private label assignments;
- its signature mode and sanitized signature snapshot; and
- a version number that prevents an older edit from silently replacing a newer one.

HQBase waits briefly while you type, then saves changes in order. Local crash recovery protects
work that has not reached the server yet. If two browser tabs edit the same draft, the older copy
cannot overwrite the newer version without a conflict.

Returning an empty editor to its last saved state cancels any pending save and shows **Draft
saved**.

### Find a draft again

When you have saved drafts, navigation shows **Drafts** with your private draft count. The list at
`/drafts` puts the most recently changed draft first. Opening `/drafts/<draft-id>` restores the
recipients, content, attachments, and reply or forward context in the same composer.

The draft list uses the same grouped list surface, header alignment, responsive row grid, attachment
lane, preview lane, time lane, label controls, and label filters as the conversation folders.
Draft-only indicators use the existing utility lanes and do not change the row geometry.

Restored complete recipients stay selected. Contact suggestions remain closed until you edit the
active recipient.

The composer shows the **To** field by default. A small down-arrow button beside it reveals the
**Cc** and **Bcc** fields. If a saved or recovered draft already contains a Cc or Bcc recipient,
HQBase reveals both optional fields when the composer opens. While both fields are empty, the
button changes to an up arrow that can hide them again. After either field contains a recipient,
the button disappears and the populated fields stay visible.

When a valid draft has plain text but no formatted content, the composer safely converts the plain
text for editing. Opening the draft does not save a new version by itself. Existing formatted
content, including inline images, remains unchanged.

A saved reply or forward reopens with its accessible conversation. The composer attaches the draft
to its exact saved target even if newer messages arrived after the save, and never repoints it at a
different message. If the target is missing or no longer accessible, HQBase blocks sending and
explains that the draft context is unavailable.

Mailbox, search, and label filters also apply to the draft list. A draft must have every selected
label to match. Draft labels stay private to the draft author. Labeling a saved reply or forward
does not change its existing conversation before send.

When the count reaches zero, **Drafts** is hidden unless you are already on that page; it remains
visible there so sending or discarding the last draft does not leave you stranded.

After a successful send, HQBase copies the draft labels to the new outbound message, then removes
the saved draft. Discarding a draft removes its private label assignments.

## Choose the From mailbox

Each mailbox has one email address and one sender name. When the mailbox and its domain can send,
HQBase sends the standard named address `Sender name <address>`. Owners and admins can change the
sender name in the mailbox details. The change applies to future messages and does not rewrite
stored mail.

Each person chooses one default From mailbox from the active mailboxes where they can send.
Onboarding records the owner's first choice, and every signed-in person can change their own choice
in **Settings**. The composer shows both the sender name and exact address for each choice. The
mailbox owns the sender name; a person or machine caller cannot replace it for one message.

- **New messages and forwards** use the address of your default mailbox. If that choice is no longer
  available, HQBase uses the first mailbox you can still send from.
- **Existing drafts** keep the exact From address that was saved with them.
- **Replies** first try the mailbox that received the selected message, if you are allowed to send
  from it. HQBase then tries your default mailbox and finally the first available sending mailbox.

HQBase checks the selected mailbox, its From address, and the domain sending status again when you
send. Losing access while a draft is open therefore prevents the message from being sent.

## Add attachments safely

You can add files with the file picker, drag and drop, or paste, and remove them before sending.
HQBase limits the combined attachment size.

Files stream directly to R2. D1 stores only the ownership, size, type, and filename needed to manage
them. Filenames and file types are treated as untrusted input, and active files are never previewed
directly.

An attachment belongs to its draft and author. Another user or draft cannot reuse it simply by
knowing its identifier.

### Insert and resize images

The message and signature editors accept safe raster images from an image picker, drop, or paste.
HQBase inserts each image at the cursor. Clicking or tapping an image selects it with a clear border
and shows one resize control at the bottom-right. The control uses the diagonal resize cursor on
pointer devices and remains large enough to drag by touch. Mouse and touch resizing preserves the
image aspect ratio. The saved width and height travel with the email, while the editor keeps the
image within the available message width. Resizing does not change the original image bytes.

Changing the draft signature does not change the authored message content or its inline attachment
references. An authenticated inline image remains visible when the editor reloads its saved HTML,
including when that image is already in the browser cache.

Images inserted into a message use the draft's private R2 storage and count toward the normal limit
of 20 files and 25 MiB. The editor uses an authenticated preview. HQBase sends only images that the
current HTML still references, as content-ID inline MIME attachments. It never creates a public R2
URL or sends a data URL. Removing an image stops it from being sent; discarding or sending the draft
removes staged objects that the final message does not use.

The MCP `add_draft_attachment` tool accepts an optional `inline` value that defaults to `false`.
For a supported inline image, the result includes the private `htmlSrc` value for that draft. The
client adds an `img` element with that exact source through `update_draft`. Clients must not construct
or reuse a source for another draft. The same type, ownership, count, and size checks apply to web
and MCP uploads.

A signature can contain at most five images and 256 KiB of decoded image data in total. The
sanitized signature and each saved draft snapshot contain their own bounded copy, so editing or
deleting the source signature does not break an older draft. HQBase converts the copy to a
content-ID attachment when it sends. SVG and other active image formats cannot be inserted inline.
Plain-text output uses the image's alternative text and keeps the surrounding text.

## Reply to the right message

Every expanded message has **Reply** and **Forward** actions. Choosing one targets that exact
message, including a message revealed from behind the earlier-message divider. The larger actions
after the final message remain shortcuts for the conversation's latest message.

For a reply, HQBase:

- puts the original sender in **To** while leaving To, Cc, and Bcc editable;
- creates standards-compliant reply headers from the selected message;
- places your new response first;
- follows it with a timestamped attribution and a limited copy of the selected message; and
- creates both formatted HTML and conventional `>`-quoted plain text.

Formatted quotes can keep safe links, tables, formatting, and supported images. Matching
content-ID images remain inline attachments. Remote image URLs remain references, so the receiving
email app can apply its own privacy policy.

HQBase removes active content, unsafe URLs, unsafe CSS, and unrelated attachments from the quoted
copy. It adds the quote on the server only when sending, so the saved draft contains what you wrote
and a quote by itself cannot make an empty reply sendable.

While writing a reply, the selected message appears below the new content as collapsed quoted
context. A small borderless gray ellipsis at the left expands or collapses it. This preview is
composer chrome: it is not copied into the draft body, and the server still creates the final reply
quote from the exact selected message when sending.

## Forward a message

Forward opens the same editable To, Cc, and Bcc fields and includes a limited plain-text copy of the
selected message as forwarded context. It uses your default From mailbox rather than assuming the
address that received the original message.

When you send from the web composer, HQBase includes the selected message's original attachments
and any files that you added to the draft. The combined files must meet the normal attachment count
and size limits. If an original attachment is unavailable or the combined files exceed a limit,
HQBase does not send the message and keeps the draft.

## Use the composer on desktop and mobile

The composer supports common email formatting, links, lists, quotes, cleaned paste, undo and redo,
and plain-text generation alongside email-compatible HTML.

Press **Command+Enter** on macOS or **Control+Enter** elsewhere to send while focus is anywhere in
the composer. Ordinary **Enter** never sends. The keyboard shortcut uses the same validation and
duplicate-send protection as the visible **Send** button, and stays inactive while sending is
disabled or an attachment is still uploading.

New messages use a separate window on desktop and a full-screen composer on compact screens. The
desktop window starts at the bottom-right, can be dragged by its header, and can be resized within
the viewport. It keeps Minimize and Close controls and does not have a maximize control. Recipient
and subject fields use subtle separators instead of large bright focus borders.

Replies and forwards appear after the conversation on desktop and above it in a focused editor on
compact screens. A desktop reply or forward can detach into the same movable window without losing
its draft state. Leaving the conversation does not detach an inline composer: HQBase keeps it active
but hidden until its conversation returns. Only the explicit **Detach composer** action changes it
into a window. Its **Return to conversation** action opens the exact conversation and restores the
composer to its inline place. Detached composers stay open while the person moves between app
destinations, and more than one composer can remain open at the same time. Minimized desktop
composers form one bottom-right row, cannot be dragged until restored, and keep their drafts active.
Opening a saved reply or forward uses the same conversation-first layout. Composer chrome respects
device safe areas.

The **To**, **Cc**, and **Bcc** fields show saved contacts and recent accessible outbound recipients
while the person types. Available From mailboxes can appear as separate suggestions labelled
**Mailbox**. The fields validate completed addresses after blur and before save or send, not after
each keystroke. See [Contacts and labels](/docs/specs/contacts-and-labels/) for suggestion ranking
and privacy.

## Use email signatures

A signature belongs to exactly one person, mailbox, or mail domain. Each scope can contain several
signatures and no more than one default. A person can use only signatures that apply to the exact
selected From address and a mailbox where they can send. Default selection uses the mailbox default,
then the person&apos;s default, then the exact domain default, and finally no signature. HQBase uses one
signature and never concatenates scopes.

Every new web draft resolves and selects the most specific applicable default when the draft starts:
mailbox, then person, then exact domain. A small **Signature** dropdown sits
directly below the rendered signature preview and outside the serialized email content. It shows the
resolved signature by name, or **No signature** when no default applies. Its menu offers applicable
personal, mailbox, and domain signatures, **No signature**, and **Manage signatures…**. It does not
show an Automatic choice. The preview and dropdown share the composer&apos;s message scroll area but
stay outside the editable authored message, so editor actions cannot change the signature content.
The preview has no card or border. Compact layouts keep a 44px target.

The draft stores `automatic`, `selected`, or `none` plus a sanitized name, HTML, and plain-text
snapshot. Editing or deleting the source signature does not rewrite a saved draft. A From change
re-resolves a draft that still follows the default policy, keeps an explicitly selected signature
only when it remains valid, and preserves **No signature**. The From and signature change share one
draft revision.

Sending assembles authored content, then the signature snapshot, then reply or forward context.
The selector never enters sent HTML or text. A signature alone does not make an empty new message or
reply sendable. Existing API clients that omit the optional signature request field keep sending the
body unchanged.

The MCP Mail actions profile applies `automatic` when `create_draft`, `send_email`,
`reply_to_message`, or `forward_message` omits the signature field. A caller can use `none`
explicitly. Updating a draft without that field preserves its saved signature choice. Existing
drafts are snapshots and HQBase does not rewrite them when this default changes.

Every signed-in person can manage personal signatures in **Settings → Signatures**. Mailbox Managers
can manage mailbox signatures. Owners and admins can manage domain signatures. Mailbox Handle-mail
users can use shared signatures but cannot manage them. The server sanitizes supported formatting,
generates equivalent plain text, validates bounded raster images, and stores the signature content
in the customer&apos;s D1 database.

## Technical details

<details>
<summary>Editor, storage, and send behavior</summary>

Autosave is debounced, serialized, revision-aware, and backed by local crash recovery. Sending and
reply context are assembled and validated on the server. Successful sends remove the private draft
only after delivery is accepted.

Draft images use private R2 objects with a server-generated content ID. Signature snapshots keep
small validated base64 image data in D1, below D1's row limit. Before delivery, the Worker replaces
private draft preview paths and signature data URLs with `cid:` references. Sent inline objects use
the same private R2 and message-attachment records as received inline images.

</details>

<details>
<summary>Automated and manual checks</summary>

Automated tests cover the persistence, access, attachment, targeting, and keyboard rules stated in
this specification.

The deployed staging suite does not automate the full rich-editor and email-rendering matrix. Gmail,
Apple Mail, Thunderbird, Outlook, and mobile web rendering remain human release-candidate checks;
HQBase does not report them as automated guarantees.

</details>
