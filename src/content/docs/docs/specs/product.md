---
title: Product principles
description: What HQBase is, what it includes, and the boundaries the product keeps.
---

## Principles

- HQBase is one complete, public, self-hosted team email workspace.
- Repository: `HQBase/hqbase`.
- License: AGPL-3.0-only.
- The repository contains the complete customer-deployed product source. The small official OAuth
  relay is also public under AGPL-3.0-only at `HQBase/hqbase-cloudflare-auth`; there is no
  private product implementation. Preserve third-party license notices and provenance.
- Release artifacts are public and verified with a signed manifest and SHA-256 digest.
- Customer mail stays in the customer's Cloudflare account.
- Customer Cloudflare credentials stay between the customer and Cloudflare.
- Installation, updates, backup, rollback, and recovery are testable and documented.
- Security and data integrity take priority over feature breadth.
- Prefer a small reliable product over a generic workspace platform.

## Product

- HQBase provides shared mailboxes, team access controls, drafts, workflows, audit history, and
  multi-domain administration in a customer-owned Cloudflare deployment.
- The owner account email is an authentication and recovery identity. It may use any valid email
  domain and does not implicitly create a mailbox.
- Installation and updates consume public, signed release assets from the canonical GitHub
  repository.
- The paid business model is outside the application. Optional setup or support may be described
  separately without gating product behavior.

The legal text in each repository controls if this policy summary differs from it.
