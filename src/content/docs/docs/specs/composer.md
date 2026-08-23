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
| Send | Rechecks mailbox access, the From address, and the domain before delivering anything. |

## Drafts are private and automatic

Only the person who created a draft can see or edit it. HQBase does not provide shared,
collaborative drafts.

A draft keeps:

- its mailbox and exact From address;
- To, Cc, and Bcc recipients;
- the subject, formatted content, and plain-text version;
- reply or forward context;
- attachments; and
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

A saved reply or forward reopens with its accessible conversation. The composer attaches the draft
to its exact saved target even if newer messages arrived after the save, and never repoints it at a
different message. If the target is missing or no longer accessible, HQBase blocks sending and
explains that the draft context is unavailable.

Mailbox and search filters also apply to the draft list. When the count reaches zero, **Drafts** is
hidden unless you are already on that page; it remains visible there so sending or discarding the
last draft does not leave you stranded.

After a successful send, HQBase removes the saved draft.

## Choose the From mailbox

Each mailbox has one email address. When the mailbox and its domain can send, that email address is
also its sender address. Each person chooses one default From mailbox from the active mailboxes
where they can send. Onboarding records the owner's first choice, and every signed-in person can
change their own choice in **Settings**.

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

New messages use a separate window on desktop and a full-screen composer on compact screens.
Replies and forwards appear after the conversation on desktop and above it in a focused editor on
compact screens. Opening a saved reply or forward uses this same conversation-first layout instead
of the new-message window. Composer chrome respects device safe areas.

## Technical details

<details>
<summary>Editor, storage, and send behavior</summary>

Autosave is debounced, serialized, revision-aware, and backed by local crash recovery. Sending and
reply context are assembled and validated on the server. Successful sends remove the private draft
only after delivery is accepted.

</details>

<details>
<summary>Automated and manual checks</summary>

Automated tests cover the persistence, access, attachment, targeting, and keyboard rules stated in
this specification.

The deployed staging suite does not automate the full rich-editor and email-rendering matrix. Gmail,
Apple Mail, Thunderbird, Outlook, and mobile web rendering remain human release-candidate checks;
HQBase does not report them as automated guarantees.

</details>
