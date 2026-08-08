# HQBase Site Guide

Static public product and documentation site for `hqbase.io`.

## Boundaries

- Present one free and open-source HQBase product for customer-owned Cloudflare infrastructure.
- Link installation and source to the public canonical `HQBase/hqbase` repository.
- Keep customer data, credentials, and application runtime out of this repository.
- Treat `src/content/docs/docs/` as the single canonical documentation source for guides,
  specifications, and maintainer procedures.
- Update the relevant canonical page in `src/content/docs/docs/` before changing shared product
  claims or behavior, using `specs/` when that concept has a separate specification.
- Preserve exact commands, behavioral detail, and maintainer procedures as pleasant public pages
  instead of replacing them with shortened summaries.
- Publish only current, authoritative documentation. Update or remove obsolete documents instead of
  adding public lifecycle badges or repeated status and visibility labels; Git history preserves
  prior versions.
- Keep documentation consistent with the canonical implementation and live deployment paths in
  `HQBase/hqbase`.

## Quality gate

```sh
pnpm check
```

After deployment, smoke test `https://hqbase.io` and `https://www.hqbase.io`.
