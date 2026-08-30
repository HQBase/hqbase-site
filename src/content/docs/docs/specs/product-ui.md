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
- Customer-owned sign-in and password pages show **Self-hosted on Cloudflare · Powered by
  HQBase** below the authentication card. **Powered by HQBase** links to `https://hqbase.io/` in a
  new browser tab or window.

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
  operating-system changes. On the compact shell, the initial page background, browser chrome, and
  device safe areas use the main app canvas color for the selected appearance.
- **All mailboxes** and each accessible mailbox show their unread Inbox count, including zero.
  Catch-all remains an owner-only, unfiltered workspace count.
- The browser title follows the selected Inbox and its unread Inbox count. **All mailboxes** uses
  **Inbox (15) - Mail**. A selected mailbox uses its address, such as
  **privacy@example.com (2) - Mail**. Omit the count and parentheses when the selected Inbox has no
  unread messages.
- The desktop header uses a compact mailbox dropdown that opens below its trigger. It lists **All
  mailboxes** and human mailboxes first. When dedicated agent mailboxes exist, an **Agent
  mailboxes** divider with an agent icon separates and labels them.
- A disabled mailbox stays in the desktop and compact mailbox filters so its historical mail
  remains available. Show **Disabled** beside its address with muted text. A deleted mailbox does
  not appear in either filter.
- Do not show a normal connection status indicator. Socket reconnects, browser-tab changes, and
  successful HTTP fallback synchronization stay silent. When neither the live event socket nor the
  HTTP API is available, show a **Connection lost** dialog. It explains that HQBase reconnects and
  refreshes mail automatically when the connection returns. Recovery closes the dialog. A person
  can dismiss it for the current outage; a later outage can show it again.
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
- Open every retained message link in a new browser tab or window. A message link never navigates
  the HQBase app or its email iframe.
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
- Apply the remote-media block to sent messages too. A sent message can include remote media from
  quoted inbound content, so message direction is not consent to load it.

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
- Every mail folder, including Drafts, uses the same list geometry as Inbox. Each mail-list scroll
  surface always reserves its vertical scrollbar gutter, so short and long folders keep the same
  horizontal position.
- The folder header and conversation list use a shared maximum width of 960 CSS pixels. Desktop
  rows keep the correspondent and utility columns compact so the subject and preview use all
  remaining space, and align every column vertically. A fixed attachment lane sits between the
  correspondent and preview, so attachment icons align between rows. On desktop, the thread count
  uses a fixed 28 CSS pixel lane with two CSS pixels of inner horizontal padding. Compact and
  desktop rows use a fixed 64 CSS pixel time lane so the preview keeps the remaining width while
  timestamps stay aligned. Labels do not reserve a column. On desktop, up to three small named
  color pills, overflow colors, and the label action sit over the trailing edge of the preview. The
  fully rounded label container uses the current conversation-row surface, including its hover or
  selected state, two CSS pixels of outer padding, and a soft directional shadow in the same color.
  The shadow extends toward the preview text but not into the thread-count lane. The preview clips
  eight CSS pixels before its trailing edge so no glyph can show past the label container. The
  container has no border, and its trailing edge stays at the same desktop position so the label
  icons align between rows. The
  complete container is the Labels button, and selecting any visible part opens the assignment
  menu. The label icon has no separate
  button background. Hovering the container changes only the icon color. Each named pill uses a
  translucent label-color background with darker color-matched text in light mode and lighter
  color-matched text in dark mode. It reserves at least a four-letter width and shows at least nine
  characters, including **Important**, before truncation.
  On compact layouts, every assigned label sits in one non-wrapping, read-only row at the bottom
  trailing edge of the message preview, separate from the star action. The trailing edge stays
  aligned with the preview boundary. If the group is wider than the preview, it extends to the left
  instead of clipping labels. A soft five CSS pixel shadow in the current row-surface color extends
  toward the preview text, giving compact rows the same edge fade as desktop with a smaller reach.
  The row does not show a label edit action; a person opens the conversation to change its labels.
  Center the labels and star on the final preview line. The star action has no rectangular hover
  surface; hover changes only its icon color. A thread count beside the correspondent uses the same
  size, weight, and color as the correspondent. The header label filter keeps its small label icon
  and restrained text. On desktop, its trailing edge aligns with the row Labels buttons at the
  trailing edge of the preview and leaves clear space before the conversation total.

### Conversation reader

- Selecting a conversation replaces the conversation list with a full-page reader that uses the
  complete mail content area on desktop and compact layouts. A labelled Back action returns to the
  same list, filters, loaded pages, and scroll position. Keep the Back action in the same position
  while the conversation loads and after the reader appears.
- Show accessible messages in chronological order. Begin with the first and final message; when
  messages sit between them, one labelled divider reports the hidden count and reveals them in
  place. The collapsed divider has only one line segment on each side of a small gray circular
  control. The control shows the count between two short bold outward arrows and has the same quiet
  treatment as the quoted-history ellipsis. Remove the divider after expansion and keep the
  messages visible until the reader closes, including when synchronization adds another message to
  the open thread.
- Show a decoded sender display name when the message provides one, and keep the exact sender
  address visible in the message header. Treat both values as untrusted message metadata.
- Show every MIME `attachment` part in the downloadable attachment list, even when the sender also
  gave the part a content ID. Keep only MIME `inline` parts out of that list because the safe HTML
  renderer displays them with the message body.
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
- Show the remote-image warning only when a blocked remote image is in content that is currently
  visible. A remote image inside collapsed quoted history does not show the warning until that
  history expands. Keep the warning compact: use no more than two lines of bold text and small
  action buttons. Use a quiet neutral-gray background. Keep the message and actions in one row on
  wider layouts, and let the actions wrap below the message on narrow layouts.
- Keep subject, read/unread, star, archive, and Trash actions at the top. In Archived, replace
  archive with **Unarchive**. In Trash, replace archive and Trash with **Restore**. Keep the current
  thread labels outside every individual message header. On desktop, put one Labels control in the
  top action toolbar directly before read or unread. Give it the same action treatment as the
  adjacent toolbar controls, but show the normal label icon and current label pills inside it. Below
  640 CSS pixels, align the same control to the trailing edge directly below the top toolbar. Give
  the row a small top inset and no lower gap before the first message header. Labels do not appear in **More
  actions**. Align the icon at the control's leading edge with clear space before the label pills.
  When no label is assigned, the editable
  control says **Add label**; the compact control also uses a light dashed border. Apply label
  changes optimistically without lowering the control opacity, and restore the previous assignment
  if the request fails. Below 640 CSS pixels, the top toolbar shows
  only star or unstar and **More actions**, in addition to Back navigation. The subject stays on one
  line and continues
  below the trailing actions when it is long. A toolbar-colored surface and matching soft shadow
  prevent subject text from showing through those actions. **More actions** contains read or
  unread, archive or unarchive, and Trash. The unread action is named **Mark Unread**. In Trash, the
  menu contains read or unread and Restore. It does not repeat star or unstar. The top toolbar
  actions always apply to the accessible conversation. Put compact **Reply** and **Forward** actions
  after every expanded message. Each expanded message also has one **More message actions** control
  for Archive or Unarchive and **Move to trash** or Restore on that exact message. Trash is not a
  permanent delete. A message moved to Trash disappears from conversation readers outside Trash.
  The Trash reader shows only messages that are in Trash. If no visible messages remain after an
  exact-message action, return to the folder list. The thread summary, message count, and unread
  count use the same visible messages: non-Trash views exclude messages in Trash, and Trash includes
  only messages in Trash. Use the larger Reply and Forward treatment after the final message; those
  actions target that final message.
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
development-only `/__ui/setup` and `/__ui/design` galleries use deterministic fixtures and never
reach production. The design gallery inventories the real shared components, common product
patterns, and representative screen states for visual review.

The Mailboxes step includes one **Mail sent to unknown addresses** choice for every selected
domain. The choices are **Deliver to a mailbox**, **Keep in Catch-all for owner review**, and
**Reject the message**. Delivery reveals a selector containing active human mailboxes from that
domain. A new setup selects its first mailbox by default, but keeps the choice visible before the
owner completes setup.

- Settings groups destinations by purpose. **Workspace** contains Mailboxes, Domains, and People;
  **Mail** contains Labels and Signatures; **Personal** contains Preferences; and **System**
  contains Updates. Hide Domains, People, and Updates from people who cannot manage them. Keep
  Updates at the bottom of the navigation. Preferences contains Appearance and Notifications.
  Settings gains search, sorting, or pagination only when the behavior needs it.
- **Labels** and **Signatures** use the same responsive table language as other Settings pages: a
  rounded bordered shell, a quiet header row, compact data rows, and a right-aligned **Actions**
  column. Labels show their name and color. Signatures show their name and preview, scope, and
  default state. Loading and empty states remain inside the table.
- Every table **Actions** column uses one three-dot icon button for each row. The button opens a
  labelled dropdown with the available row actions. Do not put separate edit, delete, or revoke
  icon buttons in that column.
- Contextual dropdowns prefer the space below their trigger. They open above it when the lower
  viewport edge does not have enough space. Keep at least eight CSS pixels from viewport edges and
  constrain long menus to the available height so their contents can scroll.
- Tab controls use a rounded pill track with even inner padding and fully rounded triggers. The
  selected trigger stays inset from every edge of the track.
- Add and create forms use labelled dialogs. A dialog closes only after an explicit close action,
  successful submission, or Escape. A backdrop click, including one that dismisses a nested
  dropdown, must not close the dialog.
- On compact screens, every dialog starts below the device top safe area with extra breathing room.
  Its maximum height also preserves the bottom safe area, and overflow scrolls inside the dialog so
  the close control stays reachable around camera cutouts and Dynamic Island hardware.
- Every dialog footer uses the normal 30px action height. Actions in one footer never mix normal,
  small, field, or custom heights.
- A drawer closes once toward its anchored edge. Its close animation must not replay its entrance.
- Directly editable active or enabled values use labelled switches in their Settings table rows.
  Keep these frequent switches out of detail panels and dialogs when the table has room for them.
- Notification permission is requested only after the person activates **Enable notifications**,
  never on load, sign-in, navigation, or incoming mail.
- Every signed-in person with a sending identity chooses a personal default From mailbox; replies
  continue to prefer the mailbox that received the original message.
- **Email domains** uses one responsive table with **Domain**, **Readiness**, **Unknown-address
  mail**, and **Active in HQBase**. The domain that contains the current workspace portal shows a
  **Portal** badge. The unmatched-mail selector offers owner review, rejection, and each eligible
  human mailbox on that domain. The selected mailbox shows **Catch-all for example.com** in mailbox
  Settings. Changing the policy affects new mail only. Exact mailbox addresses always take
  priority, which the page explains once below the table.
- Domain readiness combines receiving, sending, and DNS into one compact status. **Ready** means
  that all three components are ready. A pending or degraded status names the affected component
  when there is one issue and gives an issue count when there are several. Hover, keyboard focus,
  and press show the three component values; readiness details never require hover alone.
- **Recheck** obtains a fresh operation-specific Cloudflare grant, reads the current receiving,
  sending, and DNS state without changing Cloudflare, saves the new snapshot, and revokes the
  grant. A save or recheck disables only that domain row. **Active in HQBase** changes HQBase's
  domain flag; it does not disconnect the domain or remove Cloudflare mail configuration.
- Each email-domain row has one compact actions menu. A connected domain offers **Disconnect
  domain**. Its confirmation explains that HQBase will stop new receiving and sending, reject
  delayed mail, reset unknown-address mail to rejection, and preserve all existing mail. After a
  fresh Cloudflare authorization, HQBase removes its catch-all Worker route only when the route is
  still owned by this Worker. Shared Email Routing, Email Sending, DNS, and the portal stay in
  place.
- A disconnected row shows **Disconnected** instead of readiness controls, disables the
  unknown-address selector and active switch, and offers **Reconnect domain** and **Forget
  domain**. Reconnect uses the existing domain connection flow. Forget requires the person to type
  the exact domain name. HQBase blocks it until the domain has no mailbox, agent, domain signature,
  or stored message history, and blocks forgetting the last stored domain.
- **Mailboxes** lists active human and agent mailboxes. An owner or admin can select **Delete
  mailbox** after a confirmation explains that HQBase will hide the mailbox from normal mail views,
  stop receiving and sending, disable linked agents, and revoke their credentials while preserving
  the mailbox ID, messages, drafts, and attachments under the current retention rules. Deleted
  mailboxes do not appear in the header or default Settings list. **Deleted mailboxes** lists them
  for restoration. Restore reactivates the same mailbox, but linked agents stay disabled until an
  owner or admin separately reactivates them. HQBase blocks disablement or deletion when the
  mailbox is a catch-all destination and directs the owner or admin to change the domain policy
  first.
- **People** gives every person a compact actions menu. Pending people can receive a new invitation
  or temporary password from this menu. Active people can be removed after recent authentication
  and a confirmation. Removed people stay in the table with a **Removed** status and can be
  restored. Role controls are unavailable while a person is removed.
- Removing a person disables sign-in, ends web sessions, revokes OAuth tokens and approvals,
  cancels pending device and password-setup flows, removes push subscriptions, and removes mailbox
  grants. Mail, drafts, contacts, signatures, audit history, and the login identity remain stored.
  Restoration enables the same login identity, but it does not restore sessions, connected apps,
  notifications, or mailbox grants. The person signs in again and receives new mailbox access
  explicitly.
- An owner or admin can remove or restore a member or admin. Only an owner can remove or restore
  another owner. A person cannot remove their own account, and HQBase never removes the last active
  owner. Each successful removal and restoration creates an audit event.
- Cloudflare-backed actions never display an API-token field. Authorization starts OAuth with PKCE
  in a labelled modal. See [Cloudflare access](/docs/specs/cloudflare-oauth/) for the security
  rules.
Standard form choices use the shared dropdown control at the normal compact field height. The
mailbox selector in the header remains uniquely smaller. Primary and create actions use the normal
or small button size; the installed app does not use an extra-large button size. Shared buttons use
compact visual heights: 30px for normal and icon buttons, 27px for small buttons, and 33px for large
buttons. Special-purpose controls can keep a larger interaction target where the layout requires it.
Text inputs, text areas, dropdown fields, and grouped search inputs use the same 10px corner radius.
Shared single-line text inputs and grouped inputs use a 38px normal height and a 30px compact height.
Use the compact height in dense tables and inline field-and-action rows. Keep the normal height in
regular forms and on compact-screen form rows where the larger interaction target is useful. Shared
dropdown fields use a 34px normal height and a 30px compact height. A direct action beside a field
uses the same height as that field. Context-specific controls can keep a required layout or touch
height. Inputs, text areas, grouped inputs, search fields, and dropdown fields use the same neutral
focus border in Light and Dark modes. Keyboard focus on a bordered field changes only this border
color; it does not add a brand color, glow, ring, or focus shadow. Borderless interactive controls
use a thin one-pixel neutral outline so focus remains visible.
When a person creates a mailbox address, the field accepts the local part and selects from the email
domains available for that flow. When only one domain is available, show it as a fixed suffix. The
workspace-hostname field follows the same pattern with a subdomain and an available connected domain.
Shared data tables use 13px body text and 11px header text. Table headers use a 32px height and 10px
horizontal padding. Standard body cells use 10px horizontal padding and 4px vertical padding.
Page-specific tables do not add larger desktop cell padding or action controls. Shared action and
field sizes do not change sidebar navigation dimensions. Desktop sidebar destination rows remain
40px high, drawer destination rows remain 44px high, and quick-access controls remain 40px in both
layouts.

## Agents

The **Agents** section is one page at `/agents`. It joins delegated connections, which act for a
person, and machine identities, which hold their own credentials.

- The sidebar, compact navigation, and global search show one **Agents** destination with one
  **All connections** entry. Legacy Agents and Settings URLs normalize to `/agents`.
- One responsive **Connections** list shows OAuth connections and machine identities. Mobile rows
  keep the row action visible and put secondary access and status details below the name instead of
  requiring horizontal scrolling.
- An OAuth row has **Authorized** status while its consent exists. A machine identity has
  **Enabled**, **Disabled**, or **Mailbox deleted** status. **Enabled** means that its credential can
  authenticate; it does not claim that the software is online. Provisioning rows also show their
  current mailbox count and limit.
- **Add connection** opens one dialog with a choice per connection kind: **AI assistant** for MCP or
  the person-authorized Mail API skill, **Automation with its own mailbox** for mailbox agents, and,
  for owners and admins, **Provisioning key**. Every nested step can return to the connection-kind
  choice without closing the dialog. Each choice centers an unframed 20px icon vertically beside
  its title and description.
- MCP never pre-creates access. The person approves the client in their own browser. Creating a
  machine identity reveals its credential once with the matching public skill URL.
- Each enabled machine row menu contains **Setup instructions**, **Rotate credential**, and
  **Disable** in that order. A disabled row contains **Enable** first and **Setup instructions**
  second. Enabling it reveals a fresh credential once. A deleted mailbox identity contains only
  **Restore mailbox**. After restoration, the identity remains disabled and offers **Enable** and
  **Setup instructions**. Setup instructions show the public skill URL, explain that the saved
  credential is required, and link to the public setup guide. Status and credential recovery
  actions stay in the row menu.
- The page has no separate instructions tab or permanent developer-details section. First-time
  instructions stay in **Add connection**. Recovery instructions stay with the machine row that
  needs them.
- Workspace members who cannot manage machine identities see their own OAuth connections and only
  the **AI assistant** choice.

## Navigation and accessibility

- Primary navigation has **Mail**, **Contacts**, **Agents**, and **Settings**. Canonical mail routes are
  `/mail/inbox`, `/mail/sent`, `/mail/starred`, `/mail/archived`, `/mail/trash`, `/mail/catch-all`,
  and private drafts at `/mail/drafts` and `/mail/drafts/<draft-id>`. Earlier root-level mail and
  draft paths remain accepted and normalize to the canonical route. Contacts use `/contacts` and
  `/contacts/<contact-id>`. The canonical Agent route is `/agents`. Earlier `/agents/connections`,
  `/agents/mailboxes`, `/agents/provisioning`, `/settings/mcp`, and `/settings/agents` paths
  normalize to `/agents`. Settings routes live under `/settings/*`, including label management at
  `/settings/labels`, signature management at `/settings/signatures`, and personal appearance and
  notification controls at `/settings/preferences`. Earlier Interface and Notifications Settings
  routes normalize to Preferences. Unknown app paths
  normalize to `/mail/inbox`. The Catch-all page explains that it contains owner-only unassigned
  mail and links to Domain Settings for future delivery choices. Unassigned mail stays owner-only
  even after archive or trash actions.
- The compact navigation drawer keeps the same quick-access rail as desktop beside the current
  Mail, Contacts, Agents, or Settings navigation. The current navigation panel does not repeat
  primary section links. Selecting a quick-access section opens that section's default page and
  keeps the drawer open. Selecting a destination in the current navigation panel closes the drawer.
  While mailbox selection is open, tapping elsewhere inside the drawer dismisses only the mailbox
  selector. Choosing a mailbox applies the filter and closes the drawer. The compact drawer uses two
  adjacent panes without a divider. Its narrow quick-access rail uses the theme rail surface and
  stays square, so it is light in light mode and dark in dark mode. Its wider navigation pane keeps
  the normal sidebar surface and stays square. Opening the drawer uses the standard dimmed Sheet
  backdrop. The existing background strips keep the device safe areas outside that tint. Controls
  in the narrow rail stay horizontally centered. Desktop sidebar surfaces keep their existing
  shape. The account menu shows the current person's name and sign-out action. It does not repeat
  their workspace role.
  Only deliberate content surfaces scroll; the application shell, header, and navigation stay
  fixed and do not use native document scrolling. Scroll surfaces use a compact transparent track
  and a rounded six-pixel thumb. The thumb stays quiet until hover, when it becomes slightly more
  visible. Scrollbars never show an opaque default track or corner.
- Inbox lists, Contacts lists and details, Agents pages, and Settings pages use the same 960 CSS
  pixel maximum content width on desktop. A conversation reader continues to use the full
  available mail area.
- Every field has a persistent label and inline error. Loading buttons prevent duplicate
  submission. Errors stay limited and secret-free. Success messages say what happened, what
  remains safe, and what to do next.
- Compact editable fields use at least 16px text on iOS to avoid focus zoom. Keep focus visible,
  use 44px targets where practical, and never rely on color alone for meaning.

The header search is global while the person types. After a short debounce, an anchored result list
shows matching conversations, contacts, private drafts, and app destinations that the person can
access. Arrow keys move through results, Enter opens the active result, and Escape closes the list.
When the query is not empty, a trailing Clear search action empties it and keeps focus in the search
field.
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
never authenticated responses. When an update is ready, the app offers one deliberate reload in a
compact, rounded notice with small semibold text and a restrained elevation shadow. Reload asks the
waiting service worker to activate. If that activation signal is stale or does not arrive, the app
performs a normal page refresh after a short delay. Background offline mail storage requires a
separate privacy and delivery design.

Testing requirements and repository ownership live in
[Engineering Standards](/docs/maintainers/engineering-standards/).
