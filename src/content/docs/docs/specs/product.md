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

- Every person signs in with a unique login email. The workspace owner&apos;s login is an
  authentication and recovery identity: it may use any valid email domain and never implicitly
  becomes a shared mailbox.
- Mailbox access is explicit and never inherited from role, domain ownership, or inference. The one
  exception is stated directly: workspace owners can reach every mailbox so the workspace stays
  recoverable.
