---
title: Changing the documentation
description: Choose the right page, keep one copy, and verify every documentation change.
---

All public HQBase documentation lives at [hqbase.io/docs](https://hqbase.io/docs/), with its source
in the public `HQBase/hqbase-site` repository. The `HQBase/hqbase` repository contains the product
and signed releases, but links here instead of keeping a second copy of the docs.

## Choose where the information belongs

Ask who needs the information and what they are trying to do:

- Put installation, everyday use, access, integrations, updates, and recovery under **Using
  HQBase**.
- Put exact product rules that affect several parts of HQBase under **Product reference**.
- Put code, testing, staging, release, and documentation workflows under **For maintainers**.

Most subjects need one page, not a friendly guide plus a technical duplicate. Start with plain
language, then add a **Technical details** section on the same page when exact commands or protocol
rules are useful.

For example, mailbox permissions belong on the public **Mailbox access** page. The page can explain
the access levels to a workspace owner and still include their exact internal names at the end. A
second mailbox-permissions specification would make readers and maintainers guess which copy is
right.

Links to code and release files are supporting evidence. They do not replace an explanation in the
documentation.

## Keep only the current answer

Every published page should describe HQBase as it works now. When behavior changes, update the page
or remove information that is no longer true.

Do not publish draft, dormant, deprecated, or superseded pages beside the current answer. Git keeps
the old versions if someone needs to research the history.

The entire site is public, so pages do not need repeated **Status: Active** or **Visibility:
Public** labels. Navigation also does not use lifecycle badges.

## When product behavior changes

1. Update the existing product-reference page first, if the behavior has one.
2. List every repository that owns part of the change.
3. Change the implementation and tests in those repositories together.
4. Update the reader guide if installation, use, or operation will feel different.
5. Run the full check in every affected repository.
6. Run deployed staging checks when the behavior crosses services or repositories.

Do not call the work complete while the code, tests, product reference, and reader documentation
disagree.

## Before you finish

Run the documentation check from `hqbase-site`:

```sh
pnpm test:docs
```

It checks that every page has a title, every internal link resolves, every page appears in the
sidebar, and consolidated pages still contain the required information.

Use Git history for dates. Do not add a manually maintained `updated` field.

## Keep the Changelog automatic

The top-level [Changelog](/docs/changelog/) reads published `HQBase/hqbase` releases from GitHub's
Releases API during the static site build. It uses GitHub-rendered release-note HTML and does not
make an API request from a reader's browser.

The production workflow rebuilds the site every six hours. A checked-in release snapshot keeps the
page available when GitHub cannot respond. Keep the snapshot aligned with the latest published
release when you change the feed code.
