---
title: Product principles
description: What HQBase is, what it includes, and the boundaries the product keeps.
---

HQBase is one complete team email workspace that each customer installs in their own Cloudflare
account. It provides shared mailboxes, team access controls, drafts, workflows, audit history, and
multi-domain administration.

## Identity

- One public product. The complete customer-deployed source lives in `HQBase/hqbase`, and the small
  OAuth relay lives in `HQBase/hqbase-cloudflare-auth`. Both are public under AGPL-3.0-only. There
  is no private product implementation.
- Preserve third-party license notices and provenance.
- One signed public release channel. Installation and updates consume release artifacts from the
  canonical repository only, and every artifact is verified by a signed manifest with SHA-256
  digests before it changes anything.
- The official Deploy to Cloudflare button clones the canonical repository's `deploy` branch. That
  branch identifies the exact source commit of the latest signed public release and never follows
  unreleased changes on `main`. Only the signed-release workflow can advance it.
- The in-app updater works only with the standard HQBase production build at the repository root.
  The first managed update can start through the historical `pnpm deploy` bootstrap. HQBase then
  replaces that snapshot with one short, stable deploy command. A non-secret Workers Builds
  variable named `HQBASE_UPDATER_LOADER` contains a verified loader for the updater whose source,
  digest, and protocol are in the signed release record. Another non-secret variable locks the exact
  signed version that the user reviewed. HQBase verifies the command, loader, and version before it
  starts the build. This changes the Cloudflare build configuration, not the customer-owned
  repository. The build cannot silently switch to another release, and later automatic builds stay
  on the approved version until the user approves another update. A custom-source setup must use its
  own CI or CLI deployment path. Only one update can start at a time.
- HQBase reports a managed Workers Builds failure with a fixed operation name, bounded Cloudflare
  status and error codes, and a request ID when Cloudflare supplies one. It never labels a confirmed
  configuration or dispatch failure as unavailable authorization. It does not claim that a build
  failed to start when Cloudflare returns an ambiguous dispatch result. Diagnostics never include a
  grant, cookie, header, request body, updater-loader value, credential, or mail content. If an
  installed updater cannot start its replacement, recovery begins outside that broken route through
  the signed public release procedure. It does not patch a customer source repository.
- A signed release carries and validates every release-managed Worker binding, migration, and asset
  routing rule that its code requires. The release build restores this configuration before upload,
  including when the oldest supported bootstrap runs the first build. If that bootstrap cannot
  finish a current deployment phase, the installed app detects the exact unfinished phase and offers
  a same-release repair through the canonical updater. The repair creates a new recovery checkpoint
  before it changes D1. The current updater and release staging also confirm the required
  configuration and final migration state on Cloudflare. The updater divides its read-only schema
  inspection into statements with no more than five compound `SELECT` terms, then validates the
  combined result. A failed inspection shows the Cloudflare diagnostic and stops before repair. It
  does not log credentials or mail content.
- Installation records an unfinished create before it asks Cloudflare to create each D1 database,
  R2 bucket, or Queue. It sends each create request once. If Cloudflare accepts the create before
  its control-plane read can find the resource, HQBase retries only the exact identity read for a
  bounded period. It records ownership only after that read matches. If verification still fails,
  it keeps the fail-closed unfinished state for explicit recovery instead of recreating, adopting,
  or deleting an unverified resource.
- A Cloudflare Worker service that has no deployment is an uninstalled Worker, not an active
  release. The canonical updater can initialize this exact state after a failed first deployment.
  It continues to fail closed for every other unexpected Worker inspection error.
- The legal text in each repository controls if this summary differs from it.

## Boundaries

- Customer mail, workspace data, and app secrets stay in the customer&apos;s Cloudflare account.
  Customer Cloudflare credentials stay between the customer and Cloudflare.
- Security and data integrity take priority over feature breadth. Prefer a small reliable product
  over a generic workspace platform.
- The paid business model sits outside the application. Optional setup or support may be described
  separately, and it never gates product behavior.
- Installation, updates, backup, rollback, and recovery stay testable and documented.

## Product rules

- Every person signs in with a unique login email that does not use a domain connected to the
  workspace. The workspace owner&apos;s login is an authentication and recovery identity; it never
  implicitly becomes a shared mailbox.
- A person and a machine agent are separate identities. A machine agent has no login account or
  workspace role. Its bearer credential and exact mailbox grants give it no implicit owner, admin,
  domain, future-mailbox, or catch-all access.
- Mailbox access is explicit and never inherited from role, domain ownership, or inference. The one
  exception is stated directly: workspace owners can reach every mailbox so the workspace stays
  recoverable.
- An admin can manage the workspace and grant themselves access to any mailbox, but has no implicit
  mailbox or unassigned catch-all access. Only an owner can manage owner membership and owner
  sessions.
- A role change or user removal must leave at least one active owner. The database checks this
  condition in the mutation, including when several requests arrive together.
- Inbound mail becomes complete only after its body and attachments are stored. A retry must not
  treat a partially stored message as a completed delivery. Full plain-text bodies stay retrievable
  from R2; D1 stores a byte-bounded search projection when the text is large.
- Session-authenticated writes require the request's own origin. Bearer authentication does not
  depend on browser origin headers. JSON and upload requests have byte limits before parsing.
