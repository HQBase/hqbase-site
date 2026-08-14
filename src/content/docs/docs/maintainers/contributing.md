---
title: Contributing to HQBase
description: Make a change, open the right pull requests, and understand what HQBase maintainers handle next.
---

You do not need access to HQBase's private staging credentials to contribute. Develop and test the
change locally, open a pull request, and let an authorized HQBase maintainer handle official
staging and release publication.

## Contribution licensing and acceptance

Submission does not guarantee acceptance. Maintainers retain sole discretion over which
contributions are merged into the official HQBase project.

Unless otherwise agreed in writing, all contributions intentionally submitted to HQBase are
licensed under AGPL-3.0-only. By submitting a contribution, you confirm that you have the legal
right to license it under these terms.

## Choose the repository

Start with the repository that owns the change:

| Repository | Change it when you are working on… |
| --- | --- |
| `HQBase/hqbase` | The installed app, mail behavior, setup, recovery, updates, or Cloudflare resources. |
| `HQBase/hqbase-site` | The public website, reader documentation, product reference, or maintainer guides. |
| `HQBase/hqbase-cloudflare-auth` | The public Cloudflare OAuth redirect relay. |

Some changes need pull requests in more than one repository. For example, a new mailbox rule may
need implementation and tests in `hqbase` plus an update to the public docs in `hqbase-site`.

When product behavior changes, update the existing product-reference page first. Keep the related
reader guide consistent with it.

## Work on your change

1. Fork every repository you need to change.
2. Create a focused branch in each fork.
3. Make the code, tests, and documentation changes together.
4. Follow the repository's `AGENTS.md` and any repository-specific `CONTRIBUTING.md` instructions.
5. Run the full local check in every affected repository.

For the main `hqbase` repository, the usual local setup is:

```sh
pnpm install
pnpm db:migrate:local
pnpm check
pnpm deploy:dry-run
```

To work with a complete local demo workspace instead of the first-run setup flow, add a local-only
`HQBASE_LOCAL_SEED_PASSWORD` of 8 to 128 characters to `.dev.vars`, then run:

```sh
pnpm db:migrate:local
pnpm db:seed:local
pnpm dev
```

Sign in at `http://localhost:8787/` as `owner@hqbase.test` with that password. The seed command
writes directly to local D1 and does not add an application route, contact Cloudflare OAuth, or
change production authentication behavior.

To discard all local D1 data, rebuild the current schema, and recreate the demo workspace:

```sh
pnpm db:reset:local
pnpm db:seed:local
```

`db:reset:local` is destructive. Both commands are local-only and must never be adapted to target a
remote database.

For `hqbase-site`, run:

```sh
pnpm install
pnpm check
```

Do not include customer email, credentials, access tokens, production data, or generated secrets in
a commit, test fixture, screenshot, log, or pull-request description.

## Open the pull requests

Open a pull request from each fork to the matching `HQBase` repository. In the description:

- explain the user-visible problem and the result of the change;
- list every affected repository;
- link the related pull requests to each other;
- say which local checks you ran; and
- call out database changes, security boundaries, or recovery considerations.

Pull-request CI runs the repository's public quality checks. It does not receive protected staging,
release-signing, or production credentials.

When several pull requests must land together, explain the safe merge order. Do not make one pull
request depend on an undocumented change that has not been submitted.

## Optional Cloudflare testing

You may deploy and test a fork in a Cloudflare account you control. Use test domains, test data, and
credentials created for that account. This is optional and is separate from official HQBase
staging.

Never ask for or reuse HQBase's protected staging environment, GitHub Environment secrets, release
signing key, or production credentials. A deployment in a contributor-controlled account is useful
evidence, but it does not replace the official staging check.

## What HQBase maintainers do next

An authorized HQBase maintainer will:

1. review the code, tests, documentation, and repository boundaries;
2. request changes or approve the related pull requests;
3. run official staging when the behavior crosses deployed systems;
4. merge the pull requests in the required order; and
5. publish a signed release separately when the change is ready for customers.

Merging a contribution does not automatically publish a release. Official staging uses temporary
resources in an HQBase-controlled environment. Official releases are created from `HQBase/hqbase`
with protected GitHub Environments and the HQBase signing key.

## Report a security problem privately

Do not open a public issue or pull request that reveals an exploitable security problem, customer
data, or credentials. Use the
[private security reporting form](https://github.com/HQBase/hqbase/security/policy) instead.
