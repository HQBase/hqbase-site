---
title: Product UI
description: How HQBase should look, behave, and remain accessible across its public site and installed app.
---

HQBase should feel like one calm, practical product everywhere. The public site explains it, setup
gets a workspace running, and the installed app helps people work with shared mail without hiding
important state or permissions.

This specification records behavior, content, and accessibility contracts. It does not record
implementation values such as exact sizes, colors, timings, or markup. Code, design reviews, and
tests own those details. Specialized topics live in their own specifications: sending in
[Writing and sending mail](/docs/specs/composer/), Cloudflare authorization in
[Cloudflare access](/docs/specs/cloudflare-oauth/), permissions in
[Mailbox access](/docs/access-control/), and AI connections in [Connect AI agents](/docs/mcp/).

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

Cloudflare-owned deployment, authorization, and consent screens keep Cloudflare&apos;s design. The
OAuth relay and Device Authorization verification pages use the product brand but remain small
confirmation screens, not marketing pages. The verification page accepts a short code from the URL
or manual entry, shows the signed-in identity, requesting client, requested permissions, and exact
code before approval, never approves automatically, and never reveals a device code or token.

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
- The installed app offers explicit Light and Dark modes. Dark is the initial mode until the person
  chooses otherwise. The choice updates browser chrome, persists locally, and does not follow later
  operating-system changes.
- **All mailboxes** and each accessible mailbox show their unread Inbox count, including zero.
  Catch-all remains an owner-only, unfiltered workspace count.
- New-message Compose is a non-modal window on desktop and full-screen on compact layouts. Reply
  and Forward open within the conversation, never as a pop-up or separate browser tab. A saved
  draft reopens attached to its exact saved target. See
  [Writing and sending mail](/docs/specs/composer/) for persistence and sending rules.

## Reading mail

- Untrusted HTML is sanitized server-side and rendered in a sandboxed iframe that feels native to
  the reader: no card, border, or extra padding around the message. Remote media stays blocked
  until the person chooses **Load images**; **Always load from this sender** is a per-user,
  per-address preference. The original message remains untouched in customer storage.
- Each conversation list contains at most one row per accessible thread, newest first. The header
  shows the exact total for the active filters, and it does not change as older pages load. Paging
  cursors stay opaque and never bypass mailbox access.
- Selecting a conversation replaces the list with a full-page reader. Back returns to the same
  filters, loaded pages, and scroll position. Messages appear chronologically behind one labelled
  divider for hidden middle messages. Quoted reply history collapses behind a labelled ellipsis
  while keeping safe formatting and the remote-image choice; genuinely forwarded content stays
  visible even when the sender wrapped it in quote markup. Actions adapt to the folder
  (**Unarchive** in Archived, **Restore** in Trash). No action may read or change a mailbox outside
  the person&apos;s current access. See [Mailbox access](/docs/access-control/) for the permission
  levels.

## Setup and Settings

Setup is one quiet, resumable page. After temporary Cloudflare access is verified, progress
becomes **Domain → Owner account → Mailboxes**, with Mailboxes owning the final action. The
development-only `/__ui/setup` gallery uses deterministic fixtures and never reaches production.

- Settings contains only active workspace and infrastructure destinations, and gains search,
  sorting, or pagination only when the behavior needs it.
- Notification permission is requested only after the person activates **Enable notifications**,
  never on load, sign-in, navigation, or incoming mail.
- Every signed-in person with a sending identity chooses a personal default From mailbox; replies
  continue to prefer the mailbox that received the original message.
- Cloudflare-backed actions never display an API-token field. Authorization starts OAuth with PKCE
  in a labelled modal. See [Cloudflare access](/docs/specs/cloudflare-oauth/) for the security
  rules.
- Debug contains read-only deployment diagnostics.

## Navigation and accessibility

- Primary routes are `/inbox`, `/sent`, `/starred`, `/archived`, `/trash`, `/catch-all`, and
  private drafts at `/drafts` and `/drafts/<draft-id>`. Settings routes live under
  `/settings/*`. Unknown app paths normalize to `/inbox`. Catch-all mail stays owner-only even
  after archive or trash actions.
- Every field has a persistent label and inline error. Loading buttons prevent duplicate
  submission. Errors stay limited and secret-free. Success messages say what happened, what
  remains safe, and what to do next.
- Compact editable fields use at least 16px text on iOS to avoid focus zoom. Keep focus visible,
  use 44px targets where practical, and never rely on color alone for meaning.

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
