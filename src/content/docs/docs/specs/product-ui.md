---
title: Product UI
description: How HQBase should look, behave, and remain accessible across its public site and installed app.
---

HQBase should feel like one calm, practical product everywhere. The public site explains it, setup
gets a workspace running, and the installed app helps people work with shared mail without hiding
important state or permissions.

This specification records behavior, content, and accessibility contracts. It records exact
thresholds only when they define an accessibility or responsive behavior contract. Code, design
reviews, and tests own other implementation values such as colors, timings, and markup.
Specialized topics live in their own specifications: sending in
[Writing and sending mail](/docs/specs/composer/), Cloudflare authorization in
[Cloudflare access](/docs/specs/cloudflare-oauth/), permissions in
[Mailbox access](/docs/access-control/), machine identities in
[Agent mailboxes](/docs/agent-mailboxes/), and human-approved AI connections in
[Connect an AI tool](/docs/mcp/).

## At a glance

| Area | Rule |
| --- | --- |
| Brand | Use the complete official HQBase mark; never redraw or simplify it. |
| Appearance | Offer explicit Light and Dark modes with strong contrast and visible focus. |
| Layout | Keep desktop efficient and compact screens touch-friendly from 320px upward. |
| Feedback | Explain what happened, what remains safe, and what the person can do next. |
| Privacy | Never expose credentials or email content through logs, notifications, previews, or errors. |
| Accessibility | Use real labels, keyboard support, reduced motion, safe areas, and meaning beyond color. |

## Visual foundation

- The official asset is the transparent SVG at `hqbase/public/logo.svg`. Product, authentication,
  offline, and public pages render the complete mark without adding a background or changing its
  geometry. Favicon, Apple touch, and installable icon variants always change together.
- Use self-hosted Inter for product text and the system monospace stack only for stable identifiers.
  The product must not depend on Google Fonts, Vercel, or another remote font host.
- Prefer a quiet visual style: near-black neutrals, visible focus, restrained shadows, and no
  decorative gradients in the installed app.

## Authorization surfaces

Cloudflare-hosted deployment, authorization, and consent screens keep Cloudflare&apos;s design. The
resulting HQBase deployment remains in the customer&apos;s Cloudflare account. The OAuth relay and
Device Authorization verification pages use the product brand but remain small confirmation
screens, not marketing pages. The verification page accepts a short code from the URL or manual
entry, shows the signed-in identity, requesting client, requested permissions, and exact code before
approval, never approves automatically, and never reveals a device code or token.

## Public website and documentation

The public site presents one free and open-source team email workspace running in the customer&apos;s
Cloudflare account. One deployment owns both `/` and `/docs`.

### Landing page

The page has six parts in order: header, hero, features, public journey, FAQ, and footer.
Do not add pricing, invented customers or usage claims, or a separate hosted-product story.

- The hero leads with **Your team&apos;s email. On your Cloudflare infrastructure.**
  The product principles **Free. Open source. Self-hosted. Unlimited seats.** sit directly below the hero title.
  The final claim describes seat availability, not unlimited infrastructure.
- The hero shows the workspace as live interface markup with clearly illustrative data.
- The primary action starts the official Deploy to Cloudflare flow through an accessible readiness
  dialog listing Workers Paid, an active R2 subscription, and an active domain using Cloudflare
  DNS. **Cancel** closes the dialog and **Confirm** continues to the official deployment URL. The
  secondary action opens `/docs/`.
- The header uses compact navigation for Features, FAQ, Docs, and Discord, followed by the GitHub
  star control. The compact menu exposes the same links. The star widget is the only embedded
  third-party frame; dark mode never shows a white field behind it.
- Feature copy must not imply that MCP administers the workspace or that HQBase ships separate native apps.
- The public journey pairs an open, unframed milestone timeline with a concise mission statement.
  Completed, current, and planned steps are visually distinct without promising uncommitted features.
  The current community step invites
  people to share ideas, ask questions, and request features. One compact **Join our
  Discord** action uses Discord&apos;s official symbol and links to
  `https://discord.gg/U67PB663nf`.
- The FAQ uses the source-owned shadcn Accordion and answers only for what the product does today.
  Comparisons name alternatives fairly. Unanswered questions route to Discord.
- The footer keeps brand context, licensing, primary links including FAQ and Discord, and the
  appearance control. Its Discord link uses `https://discord.gg/U67PB663nf`.
- Landing links point only to real sections and public destinations.

### Appearance, motion, and documentation

- The landing page and documentation share one Light or Dark preference. On the first visit they
  follow the operating-system preference; afterward they remember the visitor&apos;s explicit choice.
  A change applies immediately to the page, workspace preview, and browser chrome.
- Sections reveal with short, one-time entrance motion as they enter the viewport. Content remains
  visible without JavaScript, and reduced-motion visitors see the complete static page without
  reveal transitions.
- The landing and every Starlight documentation page load Google Analytics once through the
  standard site-wide tag configured in code. This public-site
  analytics boundary does not extend to the OAuth relay or customer-owned HQBase installations.
- Public pages keep visible focus, reduced-motion support, and readable layouts from 320px through
  desktop.

## Installed app layout

- Use the desktop shell at viewport widths of 1024 CSS pixels and wider. At smaller widths, use the
  compact shell on every input type. Do not impose a minimum window size or cover the workspace
  with a request to enlarge the window.
- A responsive shell change must not remount the current page or reload an open conversation.
  When a browser tab returns to the foreground, refresh mail atomically: keep the visible list and
  open conversation in place until the authoritative newest page replaces stale data.
- The installed app offers explicit Light and Dark modes. Dark is the initial mode until the person
  chooses otherwise. The choice updates browser chrome, persists locally, and does not follow later
  operating-system changes.
- **All mailboxes** and each accessible mailbox show their unread Inbox count, including zero.
  Catch-all remains an owner-only, unfiltered workspace count.
- The desktop header uses a compact mailbox dropdown that opens below its trigger. It lists **All
  mailboxes** and human mailboxes first. When dedicated agent mailboxes exist, an **Agent
  mailboxes** divider with an agent icon separates and labels them.
- A small status indicator follows **Mail** in the sidebar. It starts gray, turns green when live
  events are connected, turns yellow while HTTP fallback synchronization is working, and turns red
  when neither connection works. Its accessible label and tooltip state the same meaning without
  relying on color. Green reports WebSocket transport health, not synchronization completeness;
  the event lease reconnect remains the bounded recovery path for a missed wake-up.
- New-message Compose is a non-modal window on desktop and full-screen on compact layouts. Reply
  and Forward open within the conversation by default. Active primary-navigation icons keep their
  selected background on hover; only inactive icons gain a hover background. Buttons and dropdowns
  do not scale or shift when pressed. A saved draft reopens attached to its exact saved target. See
  [Writing and sending mail](/docs/specs/composer/) for persistence and sending rules.

## Reading mail

### HTML messages

HQBase displays a message&apos;s HTML version when available and falls back to plain text. Untrusted HTML
is sanitized and rendered in a sandboxed iframe.

- Preserve safe formatting, tables, links, and a limited inline-style set.
- Make the message feel native to the reader: no extra card, border, corner radius, background,
  inner padding, or minimum iframe height.
- Keep the document transparent. Apply HQBase theme colors only where the sender did not provide a
  safe explicit color or background.
- Fit the iframe to its content without an internal vertical scrollbar. Preserve safe authored
  widths and allow horizontal scrolling for content wider than the reader.
- Remove scripts, forms, frames, objects, active controls, redirects, event handlers, unsafe URLs,
  and CSS that can load resources.
- Resolve `cid:` images only to allowed raster attachments from the same message.
- Block remote media until the person chooses **Load images**. **Always load from this sender** is a
  per-user, per-address preference and does not restore other removed content.

The original HTML remains in customer storage; sanitization happens when the message is displayed.

### Conversation lists

- Each list contains at most one row per accessible thread. The latest matching accessible message
  provides the sender display name when present, subject, snippet, and time. The row also shows a
  thread count above one,
  whether any accessible message has an attachment, and unread state when any accessible inbound
  message remains unread.
- A new inbound or outbound reply updates and moves the existing row instead of creating another
  row.
- Load the newest 50 matching threads first. Approaching the end loads the next page, while **Load
  more conversations** remains as a keyboard-accessible fallback, loading label, retry action, or
  disappears at the final page.
- The header always shows the exact total for the active folder, mailbox, and search filters. That
  total does not change as older pages load.
- Changing a filter returns to the newest page. Opening a conversation and returning preserves
  loaded pages and scroll position. Background refresh updates the newest page without discarding
  older loaded pages. Paging cursors stay opaque and never bypass mailbox access.
- The folder header and conversation list use a shared maximum width of 960 CSS pixels. Desktop
  rows keep the correspondent and utility columns compact so the subject and preview use all
  remaining space, and align every column vertically. A fixed attachment lane sits between the
  correspondent and preview, so attachment icons align between rows. On desktop, the thread count
  uses a fixed 28 CSS pixel lane with two CSS pixels of inner horizontal padding. Compact and
  desktop rows use a fixed 64 CSS pixel time lane so the preview keeps the remaining width while
  timestamps stay aligned. Labels do not reserve a column. On desktop, up to three small named
  color pills, overflow colors, and the label action sit over the trailing edge of the preview. The
  fully rounded label container uses the current conversation-row surface, including its hover or
  selected state, two CSS pixels of outer padding, and a solid shadow in the same color. The shadow
  extends past the container edge so preview text cannot show through. It has no blur or border.
  The preview keeps five CSS pixels of trailing padding below the label container. The container's
  trailing edge stays at the same desktop position so the label icons align between rows. The
  complete container is the Labels button, and selecting any visible part opens the assignment
  menu. The label icon has no separate
  button background. Hovering the container changes only the icon color. Each named pill uses a
  translucent label-color background with darker color-matched text in light mode and lighter
  color-matched text in dark mode. It reserves at least a four-letter width and shows at least nine
  characters, including **Important**, before truncation.
  On compact layouts, every assigned label sits in one non-wrapping, read-only row at the bottom
  trailing edge of the message preview, separate from the star action. The trailing edge stays
  aligned with the preview boundary. If the group is wider than the preview, it extends to the left
  instead of clipping labels. The row does not show a label edit action; a person opens the
  conversation to change its labels. Center the labels and star on the final preview line. A thread
  count beside the correspondent uses the same size, weight, and color as the correspondent. The
  header label filter
  keeps its small label icon and restrained text. On desktop, its trailing edge aligns with the row
  Labels buttons at the trailing edge of the preview and leaves clear space before the conversation
  total.

### Conversation reader

- Selecting a conversation replaces the conversation list with a full-page reader that uses the
  complete mail content area on desktop and compact layouts. A labelled Back action returns to the
  same list, filters, loaded pages, and scroll position.
- Show accessible messages in chronological order. Begin with the first and final message; when
  messages sit between them, one labelled divider reports the hidden count and reveals them in
  place. Remove the divider after expansion and keep the messages visible until the reader closes,
  including when synchronization adds another message to the open thread.
- Show a decoded sender display name when the message provides one, and keep the exact sender
  address visible in the message header. Treat both values as untrusted message metadata.
- Use the structural quote markers used by established mail clients. Split HTML into content before
  the quote, the quoted block, and content after the quote. Keep content before and after the quote
  visible and in its original order. Keep a signature after the quote visible. When an established
  client uses a divider or header as the quote marker, include the following previous-message
  siblings in the quoted block.
- Collapse a complete Gmail reply `gmail_quote_container`, including its attribution. Keep the
  complete container visible when its `gmail_attr` contains Gmail's forwarded-message divider, and
  do not collapse nested quote markup inside that visible forward. Do not infer quote structure
  from the message subject.
- For plain text, recognize a conventional attribution block that contains a sender email address,
  ends with a colon, and is followed by one or more `>` quoted lines. Permit wrapped attribution
  lines and blank lines before the quoted text. Do not depend on the English words `On` or `wrote`.
- When content before a recognized quote is empty, show the quote without an ellipsis. Printing and
  other full-content views include every safe fragment without changing the stored original.
- Keep subject, read/unread, star, archive, and Trash actions at the top. In Archived, replace
  archive with **Unarchive**. In Trash, replace archive and Trash with **Restore**. At every width,
  the current labels form one control directly below the header. It keeps the current desktop pill
  size, always shows the normal label icon, and uses a very light gray surface. Labels
  do not appear in **More actions**. Align the control to the trailing edge, with the icon at its
  leading edge and clear space before the label pills. When no label is assigned, the editable
  control says **Add label** and uses a light dashed border. Below 640 CSS pixels, the header shows
  only star or unstar and **More actions**, in addition to Back navigation. The subject stays on one
  line and continues
  below the trailing actions when it is long. A toolbar-colored surface and matching soft shadow
  prevent subject text from showing through those actions. **More actions** contains read or
  unread, archive or unarchive, and Trash. The unread action is named **Mark Unread**. In Trash, the
  menu contains read or unread and Restore. It does not repeat star or unstar. Put compact **Reply**
  and **Forward** actions after every expanded message and larger conversation-level actions after
  the final message.
- Opening an unread conversation marks its accessible unread inbound messages read. Star and unstar
  affect every accessible message in the thread. Archive moves accessible Inbox and Catch-all
  messages without moving Sent copies. Trash moves the accessible messages represented by the
  active folder. Unarchive and Restore return inbound mail to Inbox, outbound mail to Sent, and
  unassigned mail to Catch-all. Unarchive applies only in Archived, and Restore applies only in
  Trash.
- No list, reader, or conversation action may read or change a mailbox outside the person&apos;s current
  access. See [Mailbox access](/docs/access-control/) for the permission levels.

At widths below 640 CSS pixels, a conversation row uses the dense layout established by mobile mail
clients: avatar or sender initial at the start; sender and time on the first line; an attachment
marker, when present, before the subject and preview; and the star action at the trailing edge. A
thread count above one follows the sender on the first line as `(n)` instead of using a separate
element. The mobile star is slightly larger and aligns with the bottom preview line. Rows keep
compact outer padding and rounded corners instead of touching the screen edges. Do not hide the
sender, subject, snippet, time, star, or compact label stack to make the row fit. Larger compact and
desktop layouts keep their current horizontal row.

Every folder can filter by multiple labels without changing its mailbox, search, or folder selection.
Desktop conversation rows and the reader expose one **Labels** action that can add or remove a label
in one step. Compact rows show assignments as read-only and require the person to open the
conversation before changing them. See [Contacts and labels](/docs/specs/contacts-and-labels/) for
permissions and API behavior.

## Setup and Settings

Setup is one quiet, resumable page. After temporary Cloudflare access is verified, progress
becomes **Domain → Owner account → Mailboxes**, with Mailboxes owning the final action. The
development-only `/__ui/setup` gallery uses deterministic fixtures and never reaches production.

- Settings contains only active workspace and infrastructure destinations, and gains search,
  sorting, or pagination only when the behavior needs it.
- Tab controls use a rounded pill track with even inner padding and fully rounded triggers. The
  selected trigger stays inset from every edge of the track.
- Add and create forms use labelled dialogs. A dialog closes only after an explicit close action,
  successful submission, or Escape. A backdrop click, including one that dismisses a nested
  dropdown, must not close the dialog.
- A drawer closes once toward its anchored edge. Its close animation must not replay its entrance.
- Directly editable active or enabled values use labelled switches in their Settings table rows.
  Keep these frequent switches out of detail panels and dialogs when the table has room for them.
- Notification permission is requested only after the person activates **Enable notifications**,
  never on load, sign-in, navigation, or incoming mail.
- Every signed-in person with a sending identity chooses a personal default From mailbox; replies
  continue to prefer the mailbox that received the original message.
- **Mailboxes** lists active human and agent mailboxes. An owner or admin can select **Delete
  mailbox** after a confirmation explains that HQBase will hide the mailbox from normal mail views,
  stop receiving and sending, disable linked agents, and revoke their credentials while preserving
  the mailbox ID, messages, drafts, and attachments under the current retention rules. Deleted
  mailboxes do not appear in the header or default Settings list. **Deleted mailboxes** lists them
  for restoration. Restore reactivates the same mailbox, but linked agents stay disabled until an
  owner or admin separately reactivates them.
- **Agents** lets an owner or admin create, rotate, reactivate, and disable machine identities. A
  credential dialog shows the new secret once and the matching public skill URL with separate copy
  actions. The page never shows a saved credential again. It also shows exact mailbox grants and
  explains the effects of each lifecycle action. Provisioner creation explains that it receives
  each child agent credential and must run as a trusted control-plane service.
- **Connect AI agents** is the authoritative connection guide. It has two pill tabs in this order:
  **Your account** and **Agentic mailbox**. Both tabs use flat sections and vertical space instead
  of card containers. **Your account** shows **MCP** first, with **Read only** and **Mail actions**
  as permission profiles. A visible divider labelled **or** separates it from **Skill + API**,
  which shows the human OAuth Mail API skill. **Agentic mailbox** shows **Mailbox agent** first,
  with a create action and the mailbox skill. A divider labelled **Automate mailbox creation**
  separates **Provisioner agent**, its create action, and the provisioner skill. Only owners and
  admins see the create actions.
- Cloudflare-backed actions never display an API-token field. Authorization starts OAuth with PKCE
  in a labelled modal. See [Cloudflare access](/docs/specs/cloudflare-oauth/) for the security
  rules.
- Debug contains read-only deployment diagnostics.

Standard form choices use the shared dropdown control at the normal compact field height. The
mailbox selector in the header remains uniquely smaller. Primary and create actions use the normal
or small button size; the installed app does not use an extra-large button size.

## Navigation and accessibility

- Primary navigation has **Mail**, **Contacts**, and **Settings**. Canonical mail routes are
  `/mail/inbox`, `/mail/sent`, `/mail/starred`, `/mail/archived`, `/mail/trash`, `/mail/catch-all`,
  and private drafts at `/mail/drafts` and `/mail/drafts/<draft-id>`. Earlier root-level mail and
  draft paths remain accepted and normalize to the canonical route. Contacts use `/contacts` and
  `/contacts/<contact-id>`. Settings routes live under `/settings/*`.
  Routes include agent management at `/settings/agents`. They include label management at
  `/settings/labels` and signature management at
  `/settings/signatures`. Unknown app paths normalize to `/mail/inbox`. Catch-all mail stays
  owner-only even after archive or trash actions.
- Every field has a persistent label and inline error. Loading buttons prevent duplicate
  submission. Errors stay limited and secret-free. Success messages say what happened, what
  remains safe, and what to do next.
- Compact editable fields use at least 16px text on iOS to avoid focus zoom. Keep focus visible,
  use 44px targets where practical, and never rely on color alone for meaning.

The header search is global while the person types. After a short debounce, an anchored result list
shows matching conversations, contacts, private drafts, and app destinations that the person can
access. Arrow keys move through results, Enter opens the active result, and Escape closes the list.
Selecting a conversation, contact, or draft opens that item. Pressing Enter with no active result
applies the literal query as the Inbox search filter. Typing alone never changes the current route or
mail list.

## Feedback sounds

Sounds are quiet, generated locally, and supplemental to visible feedback. Play one send sound
only after the server confirms success, one sound per batch of newly discovered messages, and
distinct quiet sounds for toast categories. Initial loading and repeated polling of known
messages stay silent. Honor autoplay restrictions and `prefers-reduced-motion`, and fail silently
when audio is unavailable.

## PWA, updates, and notifications

Web Push is optional and per device. An encrypted push payload carries only an opaque app route, a
tag that lets newer notifications replace older ones, and the recipient&apos;s unread total - never
mail content. Activating a
notification focuses or opens the represented message; authentication and current mailbox access
remain authoritative. The service worker caches only the public shell and versioned static assets,
never authenticated responses. When an update is ready, the app offers one deliberate reload.
Background offline mail storage requires a separate privacy and delivery design.

Testing requirements and repository ownership live in
[Engineering Standards](/docs/maintainers/engineering-standards/).
