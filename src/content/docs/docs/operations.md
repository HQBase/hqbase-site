---
title: Backups and recovery
description: Check your installation, record a backup, restore data, and recover safely.
---

HQBase includes tools for checking an installation and recovering from a bad change. These tools
use the backup and version history already available in your Cloudflare account.

## Before changing anything

Before a manual deployment or database change, record both:

- the active Worker version; and
- a D1 Time Travel bookmark.

They recover different parts of the installation. A Worker rollback restores the application
code. A D1 restore replaces database state. HQBase keeps them as separate, deliberate actions so a
code problem does not unexpectedly replace current data.

## Back up, restore, or diagnose

- **`backup`** records what is needed for recovery: deployment information, a current D1 Time
  Travel bookmark, the active Worker version, and an inventory of R2 objects. It does not download
  your email or attachments.
- **`restore`** checks the backup, records one more D1 bookmark, asks for confirmation, restores D1,
  activates the recorded Worker version, and checks the result. It replaces current state, so
  treat it as a destructive action.
- **`doctor`** checks the version, database, Worker, storage, queues, email domains, and public
  update channel. It reports problems without changing anything unless you run it with
  `--repair --yes`.

For example, if a database migration fails after an update checkpoint, HQBase prints the commands
needed to inspect or restore the recorded state. It does not silently roll the database back while
new mail may still be arriving.

## Automatic cleanup

HQBase processes deletion rules, Trash cleanup, expired sessions, retries, and unused R2 objects
in small jobs that are safe to retry. Successful jobs are acknowledged. Failed jobs are retried,
then moved to a separate queue for investigation if they keep failing.

## Remove HQBase safely

HQBase keeps a small deployment record listing the Worker, D1 database, R2 bucket, queues, routes,
and domain records it created. Removal uses that record - not a name or naming pattern - to decide what
belongs to HQBase.

Resources reused from somewhere else are preserved. If ownership is missing or unclear, removal
stops before making a change. If a resource cannot be removed, HQBase keeps the deployment record
so you can fix the problem and retry.

## What logs contain

Logs and audit records may contain internal identifiers, operation names, results, durations,
counts, and request IDs. They do not contain credentials, email addresses, subjects, message
bodies, attachment names, or raw email.

The public health check reveals only basic availability. Detailed readiness and diagnostic results
require an authenticated owner or admin.

## Updates

HQBase verifies every public release before it changes your Cloudflare resources. It checks the
signature, product, downloaded file, installed version, and database compatibility. If something
fails after the recovery checkpoint, the updater prints exact recovery commands instead of
silently restoring data.

## Related guides

- [Updates and rollback](/docs/guides/updates/)
- [Deployment reference](/docs/guides/deployment/)
- [Publishing a release](/docs/maintainers/releases/)
- [Staging checks](/docs/maintainers/staging-e2e/)
- [Private security reporting](https://github.com/HQBase/hqbase/security/policy)
