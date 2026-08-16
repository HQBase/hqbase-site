# HQBase Site

Public product website and documentation for HQBase, deployed to Cloudflare Workers Static Assets
at `hqbase.io`.

HQBase is one free and open-source product under AGPL-3.0-only. The site links to the public
canonical `HQBase/hqbase` repository and its Deploy to Cloudflare flow.

The site is built with Astro. The bespoke landing page at `/` uses React islands, Tailwind CSS v4,
and source-owned shadcn/ui components. The documentation at `/docs` uses Astro Starlight and is the
single canonical home for reader guides, exact product specifications, and maintainer procedures.
The public `HQBase/hqbase` repository remains the product implementation and signed distribution
channel. Both surfaces build into one static `dist` directory and share the canonical HQBase brand
assets and self-hosted Geist fonts.

The top-level Changelog reads published releases from the GitHub Releases API during each static
build. A checked-in snapshot keeps builds available if GitHub cannot respond. The production
workflow rebuilds and deploys the site every six hours, so a new product release appears without a
browser-side API request.

## Local development

```sh
pnpm install
pnpm dev
```

Open `http://localhost:8791` for the landing page or `http://localhost:8791/docs/` for the docs.

## Validation and deployment

```sh
pnpm check
```

The gate validates tests, every documentation page and sidebar entry, migrated-content floors,
Starlight rendering, the production build, and a Cloudflare deployment dry run.

A successful `main` workflow deploys the site through the protected `production` GitHub
Environment and smoke-tests both public hostnames. Local `pnpm deploy` is reserved for incident
recovery.
