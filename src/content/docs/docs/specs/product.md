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

## Operator provisioning recovery

This contract applies to the terminal operator commands. It does not change the Deploy to
Cloudflare button, the setup wizard, or the in-app update flow.

- `pnpm hqbase install` records the Cloudflare account and the ownership of D1, R2, the primary
  queue, and the dead-letter queue in `.hqbase/deployments/<name>/manifest.json`.
- The installer records a `creating` state before each create request and records `created`
  immediately after it verifies the new resource. A retry verifies every `created` or `reused`
  resource before it continues.
- A retry does not claim a resource only because its name matches. A `creating` state is ambiguous,
  so the installer stops and keeps the manifest for manual investigation.
- D1 identity is its UUID and name. Queue identity is its ID and name. R2 identity is its bucket
  name in the recorded Cloudflare account.
- A deploy that uses the generated configuration records the Worker as deployed immediately after
  Cloudflare accepts it. Full removal deletes that recorded Worker before it deletes the queues, so
  Worker bindings cannot block queue removal.
- Removal deletes only resources recorded as `created`. It preserves `reused` resources and saves
  the manifest after each successful deletion. D1 removal always uses the recorded UUID.
- A complete version 2 manifest can move to the current format only after live identity checks. A
  version 1 manifest or an incomplete version 2 manifest is not safe to resume or remove and is
  refused without changing Cloudflare.

The legal text in each repository controls if this policy summary differs from it.
