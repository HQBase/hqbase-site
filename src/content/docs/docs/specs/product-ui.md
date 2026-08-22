---
title: Product UI
description: How HQBase should look, behave, and remain accessible across its public site and installed app.
---

HQBase should feel like one calm, practical product everywhere. The public site explains it, setup
gets a workspace running, and the installed app helps people work with shared mail without hiding
important state or permissions.

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

- The official asset is the transparent SVG at `hqbase/public/logo.svg`. Its orange letterforms and
  orange-to-white baseline form one complete mark. Product, authentication, offline, and public
  pages render it without adding a background or changing its geometry.
- Favicons use a transparent square canvas with a small optical inset. Apple touch and installable
  icons use a full-bleed near-black background with safe padding. Maskable icons keep the complete
  mark inside the platform safe zone. Every copy and derivative changes together.
- Use self-hosted Inter for product text and the system monospace stack only for stable identifiers.
  The app must not depend on Google Fonts, Vercel, or another remote font host.
- Use near-black neutrals, quiet borders, compact type, visible focus, restrained shadows, 8px
  default corners, and 6px controls. Avoid decorative gradients in the installed app.
- Use direct headings without eyebrow or overline copy. Keep labels visible and use badges only
  when they communicate useful status.
- Cards group related secondary information. Alerts hold persistent feedback. Primary, outline,
  and ghost buttons express action priority.
- Use the existing Phosphor outline icons with a restrained stroke. Disclosure, selection, and
  account icons remain visually lighter than their labels.

Cloudflare-owned deployment, authorization, and consent screens keep Cloudflare&apos;s design. The
HQBase OAuth relay uses the product logo, typography, colors, focus treatment, and compact controls,
but remains a small confirmation page rather than a marketing page. Its actions stay intrinsic and
do not become oversized or full-width on phones.

The Device Authorization verification page follows the same small relay treatment. It accepts a
short code from the URL or a labelled manual entry, preserves that code through sign-in, and never
asks the person to paste credentials or tokens into an agent. Before approval it shows the signed-in
identity, requesting client, requested permissions, Mail API resource, and exact short code. The
primary **Allow** action and secondary **Deny** action remain distinct, keyboard accessible, and
safe on compact screens. Invalid, expired, denied, and completed codes receive specific terminal
states; the page never approves automatically and never reveals a device code or token.

## Public website and documentation

The public site presents one free and open-source team email workspace running in the customer&apos;s
Cloudflare account. One deployment owns both `/` and `/docs`.

### Landing page

- Keep the page to a compact header, hero, product features, public journey, frequently asked
  questions, and one footer. Do not add pricing, fabricated adoption proof, or a separate
  hosted-product story.
- Use one shared responsive section gap between the hero illustration and features, between the
  feature grid and public journey, and between the journey and footer. Each transition owns that
  gap once; adjacent sections do not stack bottom and top padding.
- On phone-sized landing views, use one shared, slightly roomy horizontal gutter for the header, hero copy,
  features, public journey, and footer. The product stage is the deliberate full-bleed exception:
  it may extend only slightly beyond the viewport so the desktop surface feels close without
  heavily cropping the phone preview or creating horizontal page overflow.
- Reveal the hero composition, feature groups, public journey, milestones, and footer with short,
  one-time entrance motion as they enter the viewport. Use restrained direction and stagger rather
  than large movement. Content remains visible without JavaScript, and reduced-motion visitors see
  the complete static page without reveal transitions.
- Lead with **Your team&apos;s email. On your Cloudflare infrastructure.** Show the desktop
  workspace as live interface markup rather than a screenshot or decorative browser window. Use
  clearly illustrative data without invented customers, usage totals, locations, or performance
  claims.
- Present the desktop workspace and compact inbox together as one centered product stage narrower
  than the viewport. The stage rests with a deliberate backward pitch but no sideways yaw or roll.
  Keep both previews straight and place the phone over the desktop&apos;s right edge by roughly half the
  phone&apos;s width. Preserve both the overlap and the desktop-to-phone scale relationship on
  phone-sized landing views, so the phone remains a supporting preview instead of becoming the
  dominant object, without creating horizontal page overflow. Use a compact 16:9 desktop surface
  and keep the tilted composition close to the hero actions instead of leaving a large empty band.
  Size the phone at roughly one quarter of the stage width. Use a slim frame, softer neutral side
  controls in light mode, and an opaque theme-matched chassis behind the screen so underlying
  content never shows through its inner edge. Place the larger Dynamic Island close to the top edge
  and give it a subtle graphite surface in dark mode. Keep the dark-mode shadow restrained without
  a bright halo.
- A subtle orange-to-amber dot field may sit behind the product stage. Scrolling may shift the field
  while the complete composition follows the scroll downward and progressively returns its backward
  pitch and the phone&apos;s depth to a normal flat presentation. At the end of the transition, keep the
  complete mockup inside the viewport with a quiet gap below the fixed header and enough scroll
  runway that its bottom is never clipped by the hero or a following section. Keep the product stage
  above adjacent section content throughout the transition, and fade the dot field to transparent
  before its lower edge. On phone-sized views, complete the flattening motion sooner and reserve
  only the compact height the illustration needs, avoiding an empty spacer below it. Reduced-motion
  visitors receive the same static resting composition.
- The desktop preview fills the visible conversation column with illustrative inbox rows and shows
  a coherent four-message exchange in the selected conversation. The rows share the available
  height without leaving an empty band or clipping the final item. Its Compose control uses the
  same transparent outline treatment in the desktop and phone previews instead of a filled primary
  surface. Its border color matches the adjacent **All mailboxes** control exactly.
- The header begins as a flat transparent row containing the logo and compact navigation for
  Features, FAQ, Docs, and Discord, followed by the GitHub star control. Discord links to
  `https://discord.gg/U67PB663nf`. After scrolling, the header may become a narrower translucent
  pill with a quiet border and shadow. The compact menu exposes the same links.
- The hero deployment action and adjacent documentation action share the same height, two-pixel
  border weight, pill radius, type size, and horizontal padding. The deployment action adapts the
  official Cloudflare palette to the active theme: light mode uses an amber-to-coral surface with a
  black label, while dark mode uses the official black surface, two-pixel orange border, and
  amber-to-coral label. The hero gradient and modal confirmation gradient glide once on hover and
  ease back on exit; dark mode applies the same motion to the hero label. Reduced-motion visitors
  receive the static states. The action opens an animated,
  accessible readiness dialog centered in
  the viewport instead of navigating immediately. The dialog gives a concise
  three-item checklist for Workers Paid, an active R2 subscription, and an active domain using
  Cloudflare DNS, with links to the relevant Cloudflare guidance. **Cancel** closes the dialog and
  **Confirm** continues to the official deployment URL. Opening motion cascades through the
  checklist and becomes static when reduced motion is requested.
- Features use one centered heading and six flat grid cells. They cover MCP, multiple domains,
  mailbox access levels, PWA and Web Push, customer-owned Cloudflare resources, and signed updates.
  Their copy must not imply that MCP administers the workspace or that HQBase ships separate native
  apps.
- The feature matrix is slightly wider than the standard content shell and uses slightly larger
  orange Lucide icons inline with each title. It has no card surfaces, corner radius, shadow, glow,
  icon backdrop, or hover lift. Subtle orange rules use three-pixel, widely spaced dashes that
  match the visual weight of the background dots. They appear on internal row and column dividers
  only, leaving the matrix edges open. Each segment fades before its junction. On phone-sized
  views, feature rows add no second horizontal inset, keeping their icon and text axes aligned with
  the roadmap marker and milestone text axes at the shared page gutter.
- The public journey pairs an open, unframed milestone timeline with a concise mission statement.
  It uses the same wide shell and generous spatial rhythm as the feature matrix, with substantial
  breathing room between the mission, timeline heading, and individual milestones.
  Completed, current, and planned steps are visually distinct without promising uncommitted
  features. The mission is stated directly as **Let&apos;s build Cloudflare Workspace together.**
  with **Team email today, with more of your team&apos;s work coming together.** beneath it, without a
  separate eyebrow label. Current feature claims remain grounded in the team email product.
  The product principles **Free. Open source. Self-hosted. Unlimited
  seats.** sit directly below the hero title rather than inside the journey section; the final claim
  describes seat availability, not unlimited infrastructure. The timeline uses a single **Follow
  the journey** heading without a progress counter or supporting subheading. Its compact,
  sentence-case status badges all use quiet neutral backgrounds, and its milestone markers stay
  smaller than the surrounding copy. Planned milestone markers use a clearly visible muted neutral
  while remaining secondary to completed and current steps. The timeline has
  a current community step inviting people to share ideas, ask questions, and request features. It
  has separators between milestones but no top or bottom border. Each separator begins after the marker
  column so it does not cross the vertical timeline and fades at both ends. One compact **Join our
  Discord** action uses Discord&apos;s official Blurple symbol and links to
  `https://discord.gg/U67PB663nf`.
  A decorative, low-contrast dotted world map sits behind the community. It remains the
  section background rather than extending the page below it. It uses an inline,
  theme-aware vector pattern rather than external imagery, remains hidden from assistive technology,
  and crops responsively without horizontal overflow. Orange is reserved for the small current-step
  accent and the subdued map dots.
- The FAQ follows the public journey and uses the source-owned shadcn Accordion with Radix semantics,
  native keyboard behavior, and animated open and close states. It contains exactly four questions:
  what Cloudflare preparation deployment requires, how HQBase differs from Cloudflare Agentic Inbox,
  where customer data lives, and whether HQBase is fully free and open source, in that order. Keep
  the deployment preparation answer open by default. The comparison starts by acknowledging their
  shared foundation of self-hosted email on Cloudflare with AI support, then explains that HQBase
  develops it into a complete team email workspace with individual accounts, per-mailbox permissions,
  OAuth-scoped AI access, Web Push, audit history, multi-domain administration, and signed updates
  with backup and recovery, while encouraging people to try Agentic Inbox as well. The data-location
  answer states that customer data remains in customer-owned Cloudflare resources and that deployments
  are not registered with HQBase, so HQBase is not aware that an installation exists. The open-source
  answer states that the complete product, including its OAuth relay, is public under AGPL-3.0-only
  and has no per-seat fees. Keep the presentation flat and unframed, with quiet separators that fade
  at both ends. Let answer copy use almost the full accordion width instead of imposing a narrow
  reading measure. Present the heading centered above the accordion as one reading column at every
  viewport size, without question numbers or a split desktop layout. Below the accordion, center a
  quiet **Join our Discord** prompt that sends unanswered questions to
  `https://discord.gg/U67PB663nf`.
- The footer keeps brand context, licensing, primary links including FAQ and Discord, and the
  appearance control in one band. Its Discord link uses `https://discord.gg/U67PB663nf`.
- Compact navigation has a labelled menu button, traps focus, closes after navigation, prevents
  background scrolling while open, and restores scrolling afterward.

### Appearance and documentation

- The landing page and documentation share one Light or Dark preference. On the first visit they
  follow the operating-system preference; afterward they remember the visitor&apos;s explicit choice.
  A change applies immediately to the page, workspace preview, and browser chrome.
- Both use the same compact sun-or-moon button. The landing page places it in the footer.
  Documentation places it at the bottom-right of the Starlight sidebar, optically centered between
  the footer divider and browser edge.
- The landing and every Starlight documentation page load Google Analytics measurement
  `G-Z2FRK5MFMR` once through the standard Google tag. The site security policy permits only the
  Google Tag Manager script and Google Analytics collection hosts needed by that tag. This public-site
  analytics boundary does not extend to the OAuth relay or customer-owned HQBase installations.
- Documentation aligns its logo and GitHub icon to matching outer insets. The GitHub icon has no
  trailing divider. The header product label is 14px; previous and next navigation uses 12px
  direction labels with 18px titles and compact icons.
- Landing links point only to real sections and public destinations. The hero&apos;s primary action
  starts the official Deploy to Cloudflare flow, its secondary action opens `/docs/`, and Getting
  started uses Cloudflare&apos;s official deployment-button asset. The landing header places its Discord
  navigation link before the `HQBase/hqbase` star-count widget on desktop and mobile. The widget&apos;s
  iframe uses a compact fixed width and receives a dark-mode treatment without showing a white field.
  The security policy permits frames only from `ghbtns.com`.
- Every link uses the pointer cursor on mouse-capable devices. Public pages keep visible focus,
  reduced-motion support, and readable layouts from 320px through desktop.

## Authentication and account recovery

- The sign-in page links to **Forgot password?** beside the password field. The recovery form asks
  only for the person&apos;s Login email.
- A recovery request always shows the same confirmation, whether or not the Login email exists.
  The response must not reveal account existence, email delivery state, a password-reset token, or
  an invitation link.
- A valid recovery email opens `/reset-password`; an invitation continues to open `/set-password`.
  Both routes require no existing session and stay outside mailbox-route normalization. Invalid,
  expired, and used links show a specific recovery action without rendering password fields.
- Password-reset and invitation links work once and expire after seven days. Issuing a new link
  makes every older unused password link for that account invalid. After a successful password
  setup or reset, no other password link for that account remains valid. A completed password reset
  revokes the person&apos;s existing sessions and records a secret-free audit event.
- Recovery preserves a safe same-origin return path so an OAuth or Device Authorization sign-in can
  resume after the person changes their password. An untrusted external return URL is ignored.
- New passwords use 8 to 128 characters and require confirmation. Success copy distinguishes an
  accepted invitation from a recovered account, then returns the person to sign-in.

## Installed app layout

### Desktop

- Use the complete HQBase logo. The header keeps bounded search on the left and mailbox selection
  on the right. The persistent sidebar contains the **New email** action, mail folders, and Settings.
  The account menu stays at the bottom.
- The installed app offers explicit Light and Dark modes. Dark is the initial mode until the person
  chooses otherwise. The choice updates browser chrome, persists locally, and does not follow later
  operating-system changes.
- Use the desktop shell at viewport widths of 1024 CSS pixels and wider. At smaller widths, use the
  compact shell on every input type. Do not impose a minimum window width or height, and do not
  cover the workspace with a request to enlarge the window.
- The sidebar may be hidden and restored without changing the route or draft. The sidebar and mail
  content use fixed layout widths. Do not add draggable dividers, keyboard resizing, or locally
  remembered panel widths.

### Phones and compact layouts

- A hamburger immediately before search opens a left-side drawer. In mail views, the drawer shows
  **New email**, mailbox selection, folders, Settings, and the account menu. In Settings, it shows
  the permitted Settings destinations, an Inbox return action, and the account menu.
- The drawer keeps the current destination clear, uses touch-friendly targets, traps focus, returns
  focus to its trigger, and closes after selection, Escape, or backdrop dismissal.
- **All mailboxes** and each accessible mailbox show their unread Inbox count, including zero. The
  Inbox count follows the active mailbox filter. Catch-all remains an unfiltered workspace count.
- The shell, drawers, sheets, and full-screen composers respect top and bottom safe areas and the
  dynamic viewport. Their background extends beneath device cutouts; a dimmed backdrop does not
  paint the status bar, Dynamic Island, home indicator, or browser-bar regions.
- The mail header stays fixed outside the scrolling list or reader. Pull-to-refresh starts only from
  a mail list or conversation already at its top, moves that area rather than the entire app, and
  refreshes only after a deliberate release threshold. A completion message clears after two
  seconds.
- Tapping the app-owned top safe-area strip scrolls the visible mail list or reader to the top when
  the operating system allows it. After meaningful scrolling, a labelled floating up-arrow offers
  the same action near the lower-right corner and clears after use.
- Disable browser-level scroll chaining and pull-to-refresh around the app shell. Prevent accidental
  double-tap zoom and focused-field zoom while keeping pinch zoom and operating-system
  magnification available.

### AI agents and Compose

Settings > **MCP** identifies the signed-in user and switches between **MCP** and **Agent Skill**.
MCP retains the nested read-only `/mcp` and Mail actions `/mcp/full` profile switcher and shows one
absolute Streamable HTTP endpoint at a time. Agent Skill shows the deployment-local
`/skills/hqbase-mail/SKILL.md` URL with **Copy** and **Download Skill** actions. An agent following
the skill prefers Device Authorization, so the person opens a short-code verification URL in their
own browser instead of handing an agent a password or coordinating a callback. The page never asks
for a manual token. See [Connect AI agents](/docs/mcp/) for authorization and behavior.

New-message Compose is a non-modal bottom-right window on desktop with labelled minimize,
expand/restore, and close controls. It becomes full-screen on compact layouts. Reply and Forward
open after the conversation on desktop and above the conversation context on compact layouts; they
do not create a pop-up or separate browser tab. Opening a saved reply or forward from **Drafts**
uses the same conversation-first layout, restores the exact saved target, and does not turn the
draft into a new message.

Every layout preserves recipients, sending identity, reply or forward context, attachments,
formatting, autosave, submission state, durable recovery, dismissal behavior, visible focus, and
focus return. A reply prefers the exact authorized address that received the selected message and
keeps labelled, editable **To**, **Cc**, and **Bcc** fields. Minimizing, changing the window size, or
changing layout never recreates the draft. The complete persistence and sending rules live in
[Writing and sending mail](/docs/specs/composer/).

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
  provides the sender, subject, snippet, and time. The row also shows a thread count above one,
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

### Conversation reader

- Selecting a conversation replaces the conversation list with a full-page reader that uses the
  complete mail content area on desktop and compact layouts. A labelled Back action returns to the
  same list, filters, loaded pages, and scroll position.
- Show accessible messages in chronological order. Begin with the first and final message; when
  messages sit between them, one labelled divider reports the hidden count and expands or collapses
  them in place.
- Collapse quoted reply history behind a labelled ellipsis while preserving safe formatting and the
  remote-image choice. A manually forwarded message remains visible as message content even when a
  sender wraps it in markup commonly used for reply quotes.
- Keep subject, read/unread, star, archive, and Trash actions at the top. In Archived, replace
  archive with **Unarchive**. In Trash, replace archive and Trash with **Restore**. Put compact
  **Reply** and **Forward** actions after every expanded message and larger conversation-level
  actions after the final message.
- Opening an unread conversation marks its accessible unread inbound messages read. Star and unstar
  affect every accessible message in the thread. Archive moves accessible Inbox and Catch-all
  messages without moving Sent copies. Trash moves the accessible messages represented by the
  active folder. Unarchive and Restore return inbound mail to Inbox, outbound mail to Sent, and
  unassigned mail to Catch-all. Unarchive applies only in Archived, and Restore applies only in
  Trash.
- No list, reader, or conversation action may read or change a mailbox outside the person&apos;s current
  access. See [Mailbox access](/docs/access-control/) for the permission levels.

## Setup and Settings

### Setup

Setup uses one quiet resumable page. Installation and authorization appear as a compact vertical
timeline. After temporary Cloudflare access is verified, progress becomes **Domain → Owner account
→ Mailboxes**, with Mailboxes owning the final setup action.

Forms stay left-aligned with visible labels, nearby errors, `aria-invalid`, and no nested card around
the step. Mailboxes use one compact editable table with Support and Privacy defaults for each domain
and an owner-named mailbox as the final editable row. **Default From mailbox** records the owner&apos;s
initial choice.

The development-only `/__ui/setup` gallery uses deterministic fixtures without Cloudflare access,
D1 changes, or deployed resources and is excluded from production.

### Shared Settings patterns

- Tabs open directly onto their content. Add and create forms use labelled dialogs.
- Tables use one rounded, bordered scrolling container with quiet headers, compact rows, bounded
  controls, right-aligned actions, and a calm full-width empty row.
- Do not add search, sorting, pagination, or selection before the behavior needs it.
- Settings contains only active workspace and infrastructure destinations.

### Settings areas

- **API** is visible to owners, admins, and members. It lists every active workspace personal access
  token for owners and only the signed-in user's active personal access tokens for admins and
  members. The list shows the name, token owner, four-character suffix, creation time, and expiry;
  the token-owner column can be omitted when every listed token belongs to the signed-in user.
  It states that personal access tokens can call every Mail API operation, subject to the token
  owner's current role and mailbox grants, and warns that they cannot access workspace
  administration or MCP. Each row has a revoke action. Its
  confirmation names the token and explains that active clients will fail on their next request.
  Creation defaults to a 90-day expiry and permits no expiry. It requires recent authentication.
  HQBase shows the plaintext once with **Copy** and the message **Copy this token now. HQBase
  cannot show it again.** Closing the modal, leaving the page, or signing out clears the plaintext.
  Back navigation cannot restore the modal or plaintext. The create response is not cached, and
  creation is never retried automatically. After an ambiguous network result, the UI refreshes the
  metadata list so the user can find and revoke a token that might have been created.
- **Notifications** explains current-device support, subscription state, cross-device effects, and
  privacy before one explicit enable or disable action. Permission is requested only after the
  person activates **Enable notifications**, never on load, sign-in, navigation, or incoming mail.
- **Users** places accessible role guidance beside the Role heading: owners and administrators
  manage the workspace, only owners change owner membership, and administrators and members still
  need mailbox access.
- **Updates** shows installed and available stable versions in one compact line with **Check
  updates**. It reveals installation only when an update exists, then replaces it with one progress
  area containing a spinner, target version, build reference, and reassurance that HQBase remains
  available. See [Updates](/docs/guides/updates/) for the update rules.
- **Domains** separates Domain, Receive, Send, DNS, Status, and actions. Compact screens keep the
  domain and combined readiness visible while hiding individual readiness columns.
- **Mailboxes** uses a compact master-detail layout. Selecting an address or access summary opens a
  side panel on desktop and full-screen sheet on compact layouts. Lead with **People with access**
  and **Manage access**; put uncommon controls under **More settings** and call aliases
  **Additional email addresses**.
- Every signed-in user with a sending identity can choose a personal **Default From mailbox** from
  active mailboxes where they have Agent or Manager access. New messages and forwards use that
  choice; replies continue to prefer the mailbox that received the original message.
- Mailbox access remains part of Mailboxes rather than becoming a separate Settings page. Bulk
  access appears only after row selection, names the exact number and addresses affected, and writes
  explicit mailbox permissions. Domain filtering never implies inherited future access.
- Cloudflare-backed actions never display an API-token field. When authorization is needed, the
  action opens a labelled modal and starts OAuth with PKCE. An old session asks for the current
  HQBase password in that modal, resumes the exact action, and never exposes a raw API error.
  Cancellation changes nothing. Organizations blocking the public OAuth app receive a link to the
  customer-managed setup without a manual-token fallback. See
  [Cloudflare OAuth](/docs/specs/cloudflare-oauth/) for the security rules.
- **Debug** contains deployment diagnostics in one large read-only monospaced field. Domain controls
  remain under Domains.

## Navigation and accessibility

- Every field has a persistent label and associated inline error. Compact editable fields use at
  least 16px text on iOS to avoid focus zoom; desktop text may remain smaller.
- Loading buttons keep an operation-specific label and prevent duplicate submission. Errors remain
  limited and free of secrets. Success messages say what happened, what remains safe, and what to
  do next.
- Keep focus visible, use 44px targets where practical, avoid clipping on narrow screens, and never
  rely on color alone for meaning.
- Primary routes are `/inbox`, `/sent`, `/starred`, `/archived`, `/trash`, and `/catch-all`; a
  message ID appends to its folder route. Private drafts use `/drafts` and `/drafts/<draft-id>`.
  Drafts appears only when the person has drafts or is already on that page.
- Catch-all contains unassigned inbound mail that did not match a mailbox. Only owners can see or
  act on this mail. Its owner-only access stays in force after archive or trash actions.
- Settings routes are `/settings/mailboxes`, `/settings/users`, `/settings/domains`,
  `/settings/notifications`, `/settings/updates`, `/settings/api`, and `/settings/debug`. `/` and
  unknown app paths normalize to `/inbox`.
- Back and forward restore the represented route. Permission-gated Settings routes normalize only
  after the current role is known. Compose remains local UI state.
- Desktop and compact folder routes show only the conversation list. Selecting a conversation
  replaces the list with the full-page reader in the complete mail content area. Back returns to
  the same filters, loaded pages, and scroll position. The compact list uses one header with the
  active folder and conversation count.

## Audible feedback

Sounds are quiet, generated locally, and always supplemental to visible feedback. They never use a
remote audio host or block an action when browser audio is unavailable.

- Play one send sound only after the server confirms success; do not add a second toast sound.
- Play one incoming sound for a batch of newly discovered messages. Initial loading, navigation,
  filter changes, and repeated polling of known messages remain silent.
- Pull-to-refresh plays one cue when it reaches the release threshold and a distinct completion cue
  only after a successful fetch.
- Success, information, warning, and error toasts have distinct quiet sounds; loading remains
  silent.
- Honor browser autoplay restrictions and `prefers-reduced-motion`, use restrained volume, and fail
  silently when audio is unavailable.

## PWA, updates, and notifications

### Installation, offline use, and updates

- The manifest launches Inbox in standalone mode and uses product colors, official installable
  icons, and stable shortcuts only.
- The service worker caches only the public shell and versioned static assets. It never caches API,
  authentication, email, attachment, remote-media, setup, notification, or other user-specific
  responses.
- Navigation prefers the network and falls back to a branded offline page. A waiting service worker
  activates only after a deliberate reload.
- After an update starts, the app checks for the replacement service worker at a short limited
  interval and shows **Update in progress** instead of another installation action. When ready, it
  shows **A new version of HQBase is ready.** with a deliberate reload action and one quiet local
  sound when audio is available.
- Lifecycle metadata revalidates or uses no-cache; hashed assets may be immutable. Background mail
  synchronization or offline message storage requires a separate privacy and delivery design.

### Web Push and unread state

Web Push is optional and progressive. iPhone and iPad require a Home Screen web app; Android may
derive launcher state from visible notifications; unsupported devices retain the complete in-app
unread experience without a dead control.

- Subscription is explicit and per device. A user may subscribe several devices, and disabling one
  removes only that device.
- The installation owns its VAPID keys. The private key remains a Worker secret; subscription
  endpoints and encryption keys remain in D1, are never logged, and are removed when the push
  service reports them expired or gone.
- A new non-duplicate inbound message schedules notifications only for subscribed users who
  currently have read access. Delivery failure never delays or rolls back accepted mail.
- A new unassigned catch-all message schedules notifications only for subscribed owners. A null
  mailbox reference from any other cause does not make a message owner-visible.
- Every push displays a visible notification. Its encrypted payload contains only an opaque app
  route, thread replacement tag, and the recipient&apos;s unread total - never sender, recipient, subject,
  snippet, body, attachment, session, or Cloudflare data.
- Activating a notification focuses or opens the represented message. Authentication and current
  mailbox access remain authoritative; a notification never grants access.
- The unread total counts accessible unread inbound messages in Inbox and Catch-all. Navigation,
  document title, and supported app badges update from that total and clear at zero. The open app
  refreshes after mail actions, focus, foreground push, and limited polling.
- Android launcher badges remain operating-system controlled where numeric badging is unavailable.
  HQBase still provides a visible notification and exact in-app count.
- Push handling does not cache authenticated notification, unread, message, or subscription data.
  Closing a notification does not mark mail read.

Testing requirements and repository ownership live in
[Engineering Standards](/docs/maintainers/engineering-standards/).
