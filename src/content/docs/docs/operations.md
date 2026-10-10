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

- **`backup`** records a recovery checkpoint: resource identities, a current D1 Time Travel
  bookmark, the active Worker version, the database release state, and R2 bucket metadata. It does not inventory individual
  objects or download email and attachments. It cannot recover R2 objects that were deleted after
  the checkpoint. Keep an independent copy of mail objects when protection from deletion is needed.
- **`restore`** checks the backup, records one more D1 bookmark, requires `--yes`, restores D1,
  activates the recorded Worker version, and checks the result. It replaces current state, so
  treat it as a destructive action.
- **`doctor`** checks the version, database, Worker, storage, queues, email domains, and public
  update channel. It reports problems without changing anything unless you run it with
  `--repair --yes`.
- **`domain`** moves the main portal address. It attaches the new hostname, verifies it,
  deploys configuration, and then updates the main portal record. It does not change mail data or
  the identities of D1, R2, or queue resources. It refuses to continue while a previous move is
  unfinished.

For example, if a database migration fails after an update checkpoint, HQBase prints the commands
needed to inspect or restore the recorded state. It does not silently roll the database back while
new mail may still be arriving.

Before restore, HQBase checks the checkpoint's resource identities and age. After restore it
checks the database product and release state, the active Worker version, and referenced object
availability. A checkpoint remains subject to the D1 Time Travel window; an old checkpoint is
not a permanent database backup.

New recovery checkpoints use `hqbase-backup-v2` and record the account and release state.
Create a new checkpoint before an update. Older checkpoint files require manual recovery;
the restore command cannot verify their release identity. D1 checkpoint availability depends
on the account Time Travel window. A checkpoint cannot restore deleted R2 objects.

## Automatic cleanup

HQBase processes deletion rules, Trash cleanup, expired sessions, retries, and unused R2 objects
in small jobs that are safe to retry. Successful jobs are acknowledged. Failed jobs are retried,
then moved to a separate queue for investigation if they keep failing.

Jobs store progress and resume in small portions. Only completed work is skipped on retry;
failed or abandoned work can run again. R2 scans retain their cursor between queue deliveries and
batch reference checks to stay within D1 limits. Expired sessions and verification records, old
completed operation records, and rate-limit records are removed in small portions. Mail change
journals retain their documented history.

Mailboxes without an explicit retention policy use 30 days for Trash and keep other messages.
Unassigned Trash uses the same 30-day default. Cleanup continues when more messages are due than
fit in one portion.


## Remove HQBase safely

HQBase keeps a small deployment record listing the Worker, D1 database, R2 bucket, queues, routes,
and domain records it created. Removal uses that deployment record, not a name or naming pattern,
together with its Cloudflare account and recorded resource identities. D1 removal uses its UUID,
not its name.

Resources reused from somewhere else are preserved. If ownership is missing or unclear, removal
stops before making a change. If a resource cannot be removed, HQBase keeps the deployment record
and its completed cleanup steps so you can fix the problem and retry. For a created R2 bucket,
removal first permanently deletes its objects and then deletes the bucket. HQBase does not empty
storage that the deployment record marks as reused.

## What logs contain

Logs and audit records may contain internal identifiers, fixed operation names, results, durations,
counts, provider status and error codes, and request IDs when the provider supplies them. They do not
contain credentials, authorization data, cookies, request headers or bodies, updater-loader values,
email addresses, subjects, message bodies, attachment names, or raw email.

The public health check reveals only basic availability. Detailed readiness and diagnostic results
require an authenticated owner or admin.

## Updates

HQBase verifies every public release before it changes your Cloudflare resources. It checks the
signature, product, downloaded file, installed version, and database compatibility. If something
fails after the recovery checkpoint, the updater prints exact recovery commands instead of
silently restoring data.

For the HQBase 1.3.3 update-action failure, use the one-time procedure in
[Recover the HQBase 1.3.3 repair action](/docs/guides/updates/#recover-the-hqbase-133-repair-action).

## Related guides

- [Updates and rollback](/docs/guides/updates/)
- [Deployment reference](/docs/guides/deployment/)
- [Publishing a release](/docs/maintainers/releases/)
- [Staging checks](/docs/maintainers/staging-e2e/)
- [Private security reporting](https://github.com/HQBase/hqbase/security/policy)
