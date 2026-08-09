import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("Astro owns the landing and Starlight documentation routes", async () => {
  const [config, contentConfig, page, packageText, logo, favicon] = await Promise.all([
    read("astro.config.mjs"),
    read("src/content.config.ts"),
    read("src/pages/index.astro"),
    read("package.json"),
    read("public/logo.svg"),
    read("public/favicon.svg"),
  ]);
  const pkg = JSON.parse(packageText);

  assert.match(config, /from "@astrojs\/starlight"/);
  assert.match(config, /from "@astrojs\/react"/);
  assert.match(config, /site: "https:\/\/hqbase\.io"/);
  assert.match(config, /slug: "docs"/);
  assert.match(config, /\{ slug: "docs", label: "Overview" \}/);
  assert.match(config, /docsSlug\("getting-started"\)/);
  assert.match(config, /label: "Using HQBase"/);
  assert.match(config, /label: "Product reference"/);
  assert.doesNotMatch(
    config,
    /docsSlug\("specs\/(?:access-control|system-architecture|onboarding|mcp|operations|releases)"\)/,
  );
  assert.match(config, /label: "For maintainers"/);
  assert.match(config, /docsSlug\("maintainers"\), label: "Overview"/);
  assert.match(config, /docsSlug\("maintainers\/contributing"\)/);
  assert.match(config, /docsSlug\("specs\/product-ui"\)/);
  assert.match(config, /docsSlug\("maintainers\/staging-e2e"\)/);
  assert.match(config, /Sidebar: "\.\/src\/components\/starlight-sidebar\.astro"/);
  assert.match(config, /ThemeSelect: "\.\/src\/components\/starlight-theme-toggle\.astro"/);
  assert.doesNotMatch(config, /blob\/main\/docs\/README\.md/);
  assert.match(contentConfig, /docsLoader\(\)/);
  assert.match(contentConfig, /docsSchema\(\)/);
  assert.match(page, /<html lang="en">/);
  assert.match(page, /<script is:inline src="\/theme\.js"><\/script>/);
  assert.match(page, /<title>{pageTitle}<\/title>/);
  assert.match(page, /shared mailboxes, team access, and workflows running in your account/);
  assert.equal(pkg.scripts.dev.includes("astro dev"), true);
  assert.match(pkg.devDependencies.astro, /^\^/);
  assert.match(pkg.devDependencies["@astrojs/starlight"], /^\^/);
  assert.match(logo, /<title>HQBase<\/title>/);
  assert.notEqual(favicon, logo);
});

test("the landing remains the compact HQBase product page", async () => {
  const [page, heroActions, header, styles, tokens] = await Promise.all([
    read("src/pages/index.astro"),
    read("src/components/hero-actions.tsx"),
    read("src/components/ui/header-2.tsx"),
    read("public/styles.css"),
    read("public/tokens.css"),
  ]);

  assert.match(header, /<header/);
  assert.match(page, /<Header client:load \/>/);
  assert.match(page, /<WorkspaceMockup client:load \/>/);
  assert.match(page, /<FeaturesBento \/>/);
  assert.match(page, /Your team&apos;s workspace\./);
  assert.match(page, /On your Cloudflare infrastructure\./);
  assert.match(page, /<HeroActions \/>/);
  assert.doesNotMatch(page, /<Button asChild/);
  assert.match(heroActions, /<Button asChild className="hero-button" size="lg">/);
  assert.match(heroActions, /variant="outline"/);
  assert.match(heroActions, /href={deployUrl}/);
  assert.match(heroActions, /href={sourceUrl}/);
  assert.match(heroActions, /data-icon="inline-end"/);
  assert.match(heroActions, /data-icon="inline-start"/);
  assert.match(page, /href="\/docs\/"/);
  assert.match(styles, /\.site-header-nav/);
  assert.match(styles, /\.hero-title[\s\S]*line-height: 1\.08/);
  assert.match(styles, /\.feature-grid/);
  assert.match(styles, /\.site-footer/);
  assert.match(tokens, /--text-hero: clamp\(2\.375rem, 4\.5vw \+ 0\.4rem, 3\.75rem\)/);
  assert.match(tokens, /--color-shadow: oklch\(0% 0 0 \/ 12%\)[\s\S]*\.dark[\s\S]*--color-shadow: oklch\(0% 0 0 \/ 42%\)/);
  assert.equal((page.match(/<footer/g) ?? []).length, 1);
  assert.doesNotMatch(page, /Pricing|Testimonials|HQBase Pro|Community/i);
});

test("the hero keeps the live, scroll-linked workspace preview", async () => {
  const [page, mockup, styles] = await Promise.all([
    read("src/pages/index.astro"),
    read("src/components/workspace-mockup.tsx"),
    read("public/styles.css"),
  ]);

  assert.doesNotMatch(page, /hero-atmosphere|hero-glow-mark|hero-signal-grid/);
  assert.match(styles, /\.workspace-cloud-field[\s\S]*width: 100vw[\s\S]*translateX\(-50%\)/);
  assert.match(styles, /\.workspace-cloud-dots[\s\S]*radial-gradient/);
  assert.match(styles, /\.browser-screen[\s\S]*aspect-ratio: 16 \/ 10/);
  assert.match(mockup, /HQBase interface rendered live at a desktop layout/i);
  assert.match(mockup, /workspace-live workspace-desktop/);
  assert.match(mockup, /Launch assets for Friday/);
  assert.match(mockup, /All mailboxes/);
  assert.match(mockup, /window\.requestAnimationFrame\(render\)/);
  assert.match(mockup, /matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
  assert.match(mockup, /1 \+ easedProgress \* 0\.075/);
  assert.doesNotMatch(mockup, /hqbase-workspace-(?:desktop|mobile)\.png/);
});

test("appearance is shared across the landing and Starlight documentation", async () => {
  const [
    page,
    themeScript,
    toggle,
    docsToggle,
    docsSidebar,
    header,
    tokens,
    shadcnTheme,
    styles,
    starlightStyles,
  ] = await Promise.all([
    read("src/pages/index.astro"),
    read("public/theme.js"),
    read("src/components/theme-toggle.tsx"),
    read("src/components/starlight-theme-toggle.astro"),
    read("src/components/starlight-sidebar.astro"),
    read("src/components/ui/header-2.tsx"),
    read("public/tokens.css"),
    read("src/index.css"),
    read("public/styles.css"),
    read("src/styles/starlight.css"),
  ]);

  assert.match(page, /name="theme-color" content="#fafafa"/);
  assert.match(themeScript, /starlight-theme/);
  assert.match(themeScript, /legacyStorageKey = "hqbase-site-theme"/);
  assert.match(themeScript, /localStorage\.removeItem\(legacyStorageKey\)/);
  assert.match(themeScript, /matchMedia\("\(prefers-color-scheme: dark\)"\)/);
  assert.match(toggle, /const storageKey = "starlight-theme"/);
  assert.match(toggle, /localStorage\.setItem\(storageKey, theme\)/);
  assert.match(toggle, /savedTheme === "light" \|\| savedTheme === "dark"/);
  assert.match(docsToggle, /<button type="button"/);
  assert.match(docsToggle, /theme-icon-moon/);
  assert.match(docsToggle, /theme-icon-sun/);
  assert.match(docsToggle, /const storageKey = "starlight-theme"/);
  assert.match(docsToggle, /localStorage\.setItem\(storageKey, theme\)/);
  assert.doesNotMatch(docsToggle, /<select|Automatic|starlight-theme-select/);
  assert.doesNotMatch(docsToggle, /position: fixed/);
  assert.match(docsSidebar, /class="desktop-theme-control sl-hidden md:sl-flex"/);
  assert.match(
    docsSidebar,
    /desktop-theme-control[\s\S]*justify-content: flex-end[\s\S]*margin-block-start: auto/,
  );
  assert.match(docsSidebar, /padding: 0\.75rem 0\.25rem 0\.8125rem/);
  assert.match(docsSidebar, /<ThemeSelect \/>[\s\S]*<MobileMenuFooter \/>/);
  assert.match(starlightStyles, /\.header \.right-group > hqbase-theme-toggle[\s\S]*display: none/);
  assert.match(starlightStyles, /\.sidebar-content::after[\s\S]*display: none/);
  assert.match(page, /<ThemeToggle client:load className="footer-theme-toggle" \/>/);
  assert.doesNotMatch(header, /ThemeToggle|mobile-theme-row/);
  assert.match(tokens, /:root \{[\s\S]*color-scheme: light/);
  assert.match(tokens, /\.dark \{[\s\S]*color-scheme: dark/);
  assert.match(shadcnTheme, /\.dark \{[\s\S]*color-scheme: dark/);
  assert.match(styles, /a\[href\] \{[\s\S]*cursor: pointer/);
  assert.match(starlightStyles, /a\[href\] \{[\s\S]*cursor: pointer/);
  assert.match(
    starlightStyles,
    /\.expressive-code \.ec-line \.code \{[\s\S]*font-variant-ligatures: none[\s\S]*font-feature-settings: "liga" 0, "calt" 0/,
  );
  assert.match(
    starlightStyles,
    /\.expressive-code \{[\s\S]*--ec-brdRad: 0\.5rem[\s\S]*--hqbase-copy-success-icon:/,
  );
  assert.match(
    starlightStyles,
    /\.expressive-code \.frame\.is-terminal \{[\s\S]*--button-spacing: 0\.4rem/,
  );
  assert.match(
    starlightStyles,
    /\.expressive-code \.frame\.is-terminal \.header \{[\s\S]*display: none/,
  );
  assert.match(
    starlightStyles,
    /\.expressive-code \.frame\.is-terminal pre \{[\s\S]*border-top: var\(--ec-brdWd\) solid var\(--ec-brdCol\)[\s\S]*border-top-left-radius/,
  );
  assert.match(
    starlightStyles,
    /\.expressive-code \.copy button::before \{[\s\S]*border: 0/,
  );
  assert.match(
    starlightStyles,
    /\.expressive-code \.copy button::after \{[\s\S]*margin: 0\.5625rem/,
  );
  assert.match(
    starlightStyles,
    /\.expressive-code \.copy button > div \{[\s\S]*inset: 0\.375rem[\s\S]*border-radius: 0\.25rem/,
  );
  assert.match(
    starlightStyles,
    /\.expressive-code \.copy button:focus-visible \{[\s\S]*outline-offset: -0\.375rem/,
  );
  assert.match(
    starlightStyles,
    /\.expressive-code \.copy:has\(\.feedback\.show\) button::after \{[\s\S]*mask-image: var\(--hqbase-copy-success-icon\)/,
  );
  assert.match(
    starlightStyles,
    /\.expressive-code \.copy \.feedback \{[\s\S]*--tooltip-bg: var\(--sl-color-white\)[\s\S]*color: var\(--sl-color-black\)/,
  );
  assert.match(styles, /\.dark \.workspace-live \{[\s\S]*--workspace-background: hsl\(0 0% 3%\)/);
});

test("the landing header exposes the real docs destination", async () => {
  const [header, menuIcon, scrollHook, styles] = await Promise.all([
    read("src/components/ui/header-2.tsx"),
    read("src/components/ui/menu-toggle-icon.tsx"),
    read("src/components/ui/use-scroll.ts"),
    read("public/styles.css"),
  ]);

  assert.match(header, /\{ label: "Docs", href: "\/docs\/" \}/);
  assert.match(header, /useScroll\(10\)/);
  assert.match(header, /document\.body\.style\.overflow = open \? "hidden" : ""/);
  assert.match(header, /aria-expanded={open}/);
  assert.match(header, /event\.key === "Escape"/);
  assert.match(menuIcon, /stroke-dasharray/);
  assert.match(scrollHook, /window\.scrollY > threshold/);
  assert.match(styles, /\.site-header-scrolled \.site-header-nav,[\s\S]*border-radius: 999px/);
});

test("features stay inside the documented product boundary", async () => {
  const [page, features, styles] = await Promise.all([
    read("src/pages/index.astro"),
    read("src/components/ui/features-bento.tsx"),
    read("public/styles.css"),
  ]);

  assert.match(page, /<FeaturesBento \/>/);
  assert.match(features, /One home for all your team's email/);
  assert.match(features, /Email via MCP/);
  assert.match(features, /icon: Bot,[\s\S]*title: "Email via MCP"/);
  assert.match(features, /Connect AI clients over OAuth to search, draft, reply, and send/);
  assert.match(features, /One workspace for all your domains and mailboxes/);
  assert.match(features, /Give each team member access to their respective mailboxes/);
  assert.match(features, /Polished desktop and mobile PWA client with self hosted push notifications/);
  assert.match(features, /Worker, D1 mail index, and R2 attachments stay yours/);
  assert.match(features, /Verify every release, back up first, and roll back/);
  assert.match(features, /from "@\/components\/ui\/card"/);
  assert.doesNotMatch(features, /React\.useEffect|requestAnimationFrame|addEventListener|sectionRef/);
  assert.match(features, /<Card className="feature-item" key={title} role="article">/);
  assert.doesNotMatch(features, /handleCardPointerMove|resetCardPointer/);
  assert.match(features, /<CardHeader className="feature-card-header">/);
  assert.match(features, /className="feature-icon-field" aria-hidden="true"/);
  assert.match(features, /className="feature-icon-grid"/);
  assert.match(features, /className="feature-icon-mark"/);
  assert.doesNotMatch(features, /features-atmosphere|feature-icon-tile/);
  assert.match(styles, /\.features-heading[\s\S]*text-align: center/);
  assert.match(styles, /\.feature-grid[\s\S]*gap: clamp\(1\.25rem, 2\.8vw, 2rem\)/);
  assert.match(styles, /\[data-slot="card"\]\.feature-item[\s\S]*border-color: var\(--color-rule\)[\s\S]*border-radius: 0\.875rem/);
  assert.match(styles, /\[data-slot="card"\]\.feature-item[\s\S]*min-height: 11rem/);
  assert.match(styles, /\.feature-card-header[\s\S]*align-content: start[\s\S]*gap: clamp\(0\.875rem, 1\.5vw, 1\.125rem\)[\s\S]*padding: clamp\(1\.125rem, 1\.8vw, 1\.375rem\)/);
  assert.match(styles, /\.feature-icon-mark[\s\S]*z-index: 2[\s\S]*width: 1\.5rem[\s\S]*height: 1\.5rem[\s\S]*drop-shadow\(0 0 0\.75rem[\s\S]*var\(--color-accent\)[\s\S]*stroke-width: 1\.65/);
  assert.match(styles, /\.feature-icon-field[\s\S]*width: 3rem[\s\S]*height: 2\.5rem[\s\S]*var\(--color-ink\) 24%[\s\S]*58%[\s\S]*transparent 94%/);
  assert.match(styles, /\.feature-icon-field::after[\s\S]*width: 2\.125rem[\s\S]*height: 2\.125rem[\s\S]*border-radius: 50%[\s\S]*background: color-mix[\s\S]*var\(--color-paper-2\)[\s\S]*backdrop-filter: blur\(0\.125rem\)[\s\S]*box-shadow: 0 0 0\.75rem 0\.1875rem[\s\S]*filter: blur\(0\.125rem\)/);
  assert.match(styles, /\.feature-icon-grid[\s\S]*--feature-grid-neutral:[\s\S]*background: linear-gradient\([\s\S]*135deg[\s\S]*var\(--feature-grid-neutral\)[\s\S]*mask-image:[\s\S]*linear-gradient\(to right[\s\S]*linear-gradient\(to bottom[\s\S]*mask-size: 0\.75rem 0\.75rem/);
  assert.doesNotMatch(styles, /\.feature-icon-grid::after|\.feature-item:hover|--feature-card-lift/);
  assert.doesNotMatch(styles, /color-feature-grid-light|color-feature-shine/);
  assert.match(styles, /\.features-heading > p[\s\S]*font-size: 0\.9375rem/);
  assert.match(styles, /@media \(min-width: 64rem\)[\s\S]*\.features-heading h2[\s\S]*white-space: nowrap/);
  assert.match(styles, /\.feature-card-title h3[\s\S]*1\.0625rem[\s\S]*1\.1875rem/);
  assert.match(styles, /\.feature-card-description p[\s\S]*font-size: 0\.875rem/);
  assert.doesNotMatch(styles, /\[data-slot="card"\]\.feature-item\s*\{[^}]*\btransition:/);
  assert.doesNotMatch(styles, /\.feature-icon-mark\s*\{[^}]*\btransition:/);
  assert.doesNotMatch(styles, /feature-card-rotate/);
  assert.doesNotMatch(styles, /\[data-slot="card"\]\.feature-item\s*\{[^}]*rotate[XY]\(/);
  assert.doesNotMatch(styles, /features-atmosphere|features-scroll|features-matter/);
  assert.doesNotMatch(styles, /feature-item::before/);
  assert.doesNotMatch(styles, /feature-shader-flow/);
  assert.doesNotMatch(features, /eyebrow|kicker|Preview/);
  assert.doesNotMatch(styles, /feature-bento|feature-tool-cycle|features-kicker/);
  assert.doesNotMatch(features, /free trial|license key|HQBase Pro|Community/i);
});

test("Starlight keeps the complete public guides, reference, and maintainer workflows", async () => {
  const [
    overview,
    gettingStarted,
    cloudflareEmail,
    architecture,
    access,
    mcp,
    operations,
    deployment,
    updates,
    composer,
    product,
    productUi,
    maintainerOverview,
    contributing,
    documentation,
    engineering,
    releases,
    staging,
    styles,
  ] = await Promise.all([
    read("src/content/docs/docs/index.mdx"),
    read("src/content/docs/docs/getting-started.md"),
    read("src/content/docs/docs/guides/cloudflare-email-setup.md"),
    read("src/content/docs/docs/architecture.md"),
    read("src/content/docs/docs/access-control.md"),
    read("src/content/docs/docs/mcp.md"),
    read("src/content/docs/docs/operations.md"),
    read("src/content/docs/docs/guides/deployment.md"),
    read("src/content/docs/docs/guides/updates.md"),
    read("src/content/docs/docs/specs/composer.md"),
    read("src/content/docs/docs/specs/product.md"),
    read("src/content/docs/docs/specs/product-ui.md"),
    read("src/content/docs/docs/maintainers/index.mdx"),
    read("src/content/docs/docs/maintainers/contributing.md"),
    read("src/content/docs/docs/maintainers/documentation.md"),
    read("src/content/docs/docs/maintainers/engineering-standards.md"),
    read("src/content/docs/docs/maintainers/releases.md"),
    read("src/content/docs/docs/maintainers/staging-e2e.md"),
    read("src/styles/starlight.css"),
  ]);

  assert.doesNotMatch(overview, /template: splash|^hero:/m);
  assert.match(overview, /HQBase\/hqbase/);
  assert.match(overview, /## What do you want to do\?/);
  assert.match(overview, /Install HQBase/);
  assert.match(overview, /Manage mailbox access/);
  assert.match(overview, /Connect AI tools/);
  assert.match(overview, /Back up or recover/);
  assert.match(overview, /## Building or maintaining HQBase\?/);
  assert.match(
    gettingStarted,
    /\[!\[Deploy to Cloudflare\]\(https:\/\/deploy\.workers\.cloudflare\.com\/button\)\]\(https:\/\/deploy\.workers\.cloudflare\.com\/\?url=/,
  );
  assert.match(
    gettingStarted,
    /## What you need[\s\S]*Workers Paid[\s\S]*R2 subscription[\s\S]*Cloudflare DNS[\s\S]*## Install HQBase/,
  );
  assert.doesNotMatch(gettingStarted, /## Configure email routing/);
  assert.match(gettingStarted, /safely leave and return to setup later/);
  assert.match(cloudflareEmail, /title: Email setup and troubleshooting/);
  assert.match(cloudflareEmail, /there is no separate Email Routing or Email Sending step/);
  assert.match(cloudflareEmail, /## What HQBase configures/);
  assert.match(cloudflareEmail, /## Fix a receiving problem/);
  assert.match(cloudflareEmail, /## Fix a sending problem/);
  assert.match(cloudflareEmail, /## Technical details/);
  assert.doesNotMatch(cloudflareEmail, /## (?:Inbound|Outbound) Checklist/);
  assert.match(architecture, /shared email workspace that runs in your Cloudflare account/);
  assert.match(architecture, /## What this means/);
  assert.match(architecture, /## How the pieces fit together/);
  assert.match(architecture, /## How mail moves/);
  assert.match(architecture, /support@example\.com/);
  assert.match(architecture, /auth\.hqbase\.io/);
  assert.match(access, /Access level/);
  assert.match(access, /Organize mail/);
  assert.match(access, /Set deletion rules/);
  assert.doesNotMatch(access, /Change shared state|\| Retention \|/);
  assert.match(access, /expires after seven days/);
  assert.match(access, /Only an owner can make[\s\S]*another owner/);
  assert.match(access, /## How access is enforced/);
  assert.match(access, /An AI tool cannot[\s\S]*access/);
  assert.match(access, /audit records do not contain email content/);
  assert.match(access, /never a password or invitation link/);
  assert.match(access, /Pre-launch schema consolidation/);
  assert.match(mcp, /Read-only[\s\S]*\/mcp/);
  assert.match(mcp, /Mail actions[\s\S]*\/mcp\/full/);
  assert.match(mcp, /## Connect an AI tool/);
  assert.match(mcp, /## Your mailbox access still applies/);
  assert.match(mcp, /## Technical details/);
  assert.match(mcp, /list_mailboxes/);
  assert.match(mcp, /10 MiB/);
  assert.match(operations, /## Before changing anything/);
  assert.match(operations, /## Back up, restore, or diagnose/);
  assert.match(operations, /## Remove HQBase safely/);
  assert.match(operations, /deployment record[\s\S]*not a name or naming pattern/);
  assert.match(deployment, /VAPID_PUBLIC_KEY/);
  assert.match(deployment, /non-secret record that recovery and removal commands can use/);
  assert.match(updates, /## What HQBase protects before updating/);
  assert.match(updates, /## If something goes wrong/);
  assert.match(updates, /## Technical details/);
  assert.doesNotMatch(
    [overview, gettingStarted, architecture, access, mcp, operations, deployment, updates].join("\n"),
    /canonical|mailbox grant|runtime secrets|bounded|idempotent|protected resource/i,
  );
  assert.match(composer, /## At a glance/);
  assert.match(composer, /## Drafts are private and automatic/);
  assert.match(composer, /## Choose the From address/);
  assert.match(composer, /## Reply to the right message/);
  assert.match(composer, /## Use the composer on desktop and mobile/);
  assert.match(composer, /<summary>Editor, storage, and send behavior<\/summary>/);
  assert.match(composer, /<summary>Automated and manual checks<\/summary>/);
  assert.doesNotMatch(composer, /## Acceptance|optimistic revision|bounded quoted copy/);
  assert.doesNotMatch(product, /Status:|Visibility:|text: Active/);
  assert.match(productUi, /## At a glance/);
  assert.match(productUi, /## Public website and documentation/);
  assert.match(productUi, /## Installed app layout/);
  assert.match(productUi, /## Reading mail/);
  assert.match(productUi, /## Setup and Settings/);
  assert.match(productUi, /## PWA, updates, and notifications/);
  assert.doesNotMatch(productUi, /## Acceptance|## Affected repositories/);
  assert.match(maintainerOverview, /title: For maintainers/);
  assert.match(maintainerOverview, /Contribute to HQBase/);
  assert.match(maintainerOverview, /Change the documentation/);
  assert.match(maintainerOverview, /Make a product change/);
  assert.match(maintainerOverview, /Check a deployed change/);
  assert.match(maintainerOverview, /Publish a release/);
  assert.match(maintainerOverview, /## The usual order/);
  assert.match(contributing, /## Choose the repository/);
  assert.match(contributing, /## Open the pull requests/);
  assert.match(contributing, /## Optional Cloudflare testing/);
  assert.match(contributing, /## What HQBase maintainers do next/);
  assert.match(contributing, /does not receive protected staging/);
  assert.match(contributing, /does not automatically publish a release/);
  assert.match(contributing, /resources in an HQBase-controlled environment/);
  assert.match(documentation, /All public HQBase documentation lives at/);
  assert.match(documentation, /Most subjects need one page/);
  assert.match(documentation, /Every published page should describe HQBase as it works now/);
  assert.match(documentation, /pages do not need repeated \*\*Status: Active\*\*/);
  assert.match(documentation, /## When product behavior changes/);
  assert.match(documentation, /pnpm test:docs/);
  assert.doesNotMatch(documentation, /Document layers|single canonical home|progressive detail/);
  assert.match(engineering, /## Find the owner/);
  assert.match(engineering, /hqbase-cloudflare-auth/);
  assert.match(engineering, /## Check the interface as a person would use it/);
  assert.match(engineering, /Notification changes must cover/);
  assert.match(engineering, /## Before you call it done/);
  assert.match(releases, /## Publish the release/);
  assert.match(releases, /previous stable release/);
  assert.match(releases, /## Evidence required/);
  assert.match(
    releases,
    /^---[\s\S]*?---\n\n:::caution\[Authorized release maintainers only\][\s\S]*?:::\n\nPublishing is/m,
  );
  assert.match(releases, /protected release and staging environments/);
  assert.match(staging, /title: Checking a deployed change/);
  assert.match(staging, /## What staging proves/);
  assert.match(staging, /## Keep staging isolated/);
  assert.match(staging, /gh workflow run staging-e2e\.yml/);
  assert.match(
    staging,
    /^---[\s\S]*?---\n\n:::caution\[Authorized maintainers only\][\s\S]*?:::\n\nStaging proves/m,
  );
  assert.match(staging, /protected staging environment/);
  assert.doesNotMatch(
    [overview, gettingStarted, architecture, access, mcp, operations].join("\n"),
    /github\.com\/HQBase\/hqbase\/blob\/main\/docs\//,
  );
  assert.match(styles, /"Geist Sans"/);
  assert.match(styles, /--sl-color-accent: #ff8a3d/);
  assert.match(styles, /--sl-color-bg: #111111;[\s\S]*--sl-color-bg-nav: #111111;[\s\S]*--sl-color-bg-sidebar: #151515/);
  assert.match(styles, /:root\[data-theme="light"\][\s\S]*--sl-color-bg: #fafafa;[\s\S]*--sl-color-bg-nav: #ffffff;[\s\S]*--sl-color-bg-sidebar: #ffffff/);
  assert.doesNotMatch(styles, /#141312|#111110|#181716|#fbfaf9|#f8f6f4/);
  assert.match(styles, /\.social-icons a,[\s\S]*\.social-icons a:hover[\s\S]*color: var\(--sl-color-white\)/);
  assert.match(
    styles,
    /\.header \.social-icons::after[\s\S]*display: none[\s\S]*border: 0[\s\S]*content: none/,
  );
  assert.match(styles, /\.right-sidebar-panel :where\(a\)[\s\S]*\[aria-current="true"\][\s\S]*color: var\(--sl-color-white\)/);
  assert.match(styles, /\.right-sidebar-panel :where\(a\)\[aria-current="true"\][\s\S]*var\(--sl-color-accent\) 7%/);
  assert.match(styles, /\.sidebar-content \[aria-current="page"\][\s\S]*var\(--sl-color-accent\) 14%/);
  assert.match(styles, /\.site-title[\s\S]*font-size: 0\.875rem/);
  assert.match(styles, /\.pagination-links a[\s\S]*font-size: 0\.75rem/);
  assert.match(styles, /\.pagination-links \.link-title[\s\S]*font-size: 1\.125rem/);
  assert.match(styles, /\.pagination-links svg[\s\S]*width: 1\.125rem[\s\S]*height: 1\.125rem/);
  assert.doesNotMatch(styles, /googleapis|fontshare/);
});

test("the design scaffold and local assets remain available", async () => {
  const [configText, packageText] = await Promise.all([
    read("components.json"),
    read("package.json"),
  ]);
  const config = JSON.parse(configText);
  const pkg = JSON.parse(packageText);

  assert.equal(config.style, "radix-nova");
  assert.equal(config.tailwind.css, "src/index.css");
  assert.match(pkg.dependencies.react, /^\^/);

  for (const path of [
    "src/components/ui/button.tsx",
    "src/components/ui/card.tsx",
    "src/components/ui/dialog.tsx",
    "public/favicon.svg",
    "public/logo.svg",
    "public/styles.css",
    "public/theme.js",
    "public/tokens.css",
    "public/fonts/Geist-Regular.woff2",
    "public/fonts/Geist-SemiBold.woff2",
    "public/fonts/GeistMono-Regular.woff2",
    "public/404.html",
  ]) {
    assert.equal((await stat(new URL(path, root))).isFile(), true, `missing local asset: ${path}`);
  }
});

test("Cloudflare deploys the Astro build with the security baseline", async () => {
  const [wrangler, headers, packageText, readme, workflow, license] = await Promise.all([
    read("wrangler.jsonc"),
    read("public/_headers"),
    read("package.json"),
    read("README.md"),
    read(".github/workflows/ci.yml"),
    read("LICENSE"),
  ]);
  const pkg = JSON.parse(packageText);

  assert.match(wrangler, /"directory": "\.\/dist"/);
  assert.match(pkg.scripts.build, /astro check &&[\s\S]*astro build/);
  assert.match(pkg.scripts.check, /pnpm test && pnpm test:docs && pnpm build && pnpm deploy:dry-run/);
  assert.equal(pkg.scripts["test:docs"], "node scripts/check-docs.mjs");
  assert.match(readme, /http:\/\/localhost:8791\/docs\//);
  assert.match(workflow, /https:\/\/hqbase\.io\/docs\//);
  assert.match(workflow, /github\.repository == 'HQBase\/hqbase-site'/);
  assert.match(license, /GNU AFFERO GENERAL PUBLIC LICENSE/);
  assert.match(headers, /Content-Security-Policy:/);
  assert.match(headers, /script-src[^;]*'wasm-unsafe-eval'/);
  assert.match(headers, /img-src[^;]*https:\/\/deploy\.workers\.cloudflare\.com/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /Strict-Transport-Security:/);
});
