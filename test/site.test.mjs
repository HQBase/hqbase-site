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
  assert.match(page, /HQBase - your team's email on Cloudflare/);
  assert.match(page, /HQBase gives your team email on your Cloudflare infrastructure/);
  assert.match(page, /shared mailboxes, team access, and workflows running in your account/);
  assert.equal(pkg.scripts.dev.includes("astro dev"), true);
  assert.match(pkg.devDependencies.astro, /^\^/);
  assert.match(pkg.devDependencies["@astrojs/starlight"], /^\^/);
  assert.match(logo, /<title>HQBase<\/title>/);
  assert.notEqual(favicon, logo);
});

test("Google Analytics covers the landing and every Starlight documentation page", async () => {
  const [page, config, headers, productUi, cloudflareOauth] = await Promise.all([
    read("src/pages/index.astro"),
    read("astro.config.mjs"),
    read("public/_headers"),
    read("src/content/docs/docs/specs/product-ui.md"),
    read("src/content/docs/docs/specs/cloudflare-oauth.md"),
  ]);

  assert.equal((page.match(/G-Z2FRK5MFMR/g) ?? []).length, 2);
  assert.match(
    page,
    /<script is:inline async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-Z2FRK5MFMR"><\/script>/,
  );
  assert.match(page, /window\.dataLayer = window\.dataLayer \|\| \[\];/);
  assert.match(page, /function gtag\(\)\{dataLayer\.push\(arguments\);\}/);
  assert.match(page, /gtag\('config', 'G-Z2FRK5MFMR'\);/);

  assert.equal((config.match(/G-Z2FRK5MFMR/g) ?? []).length, 1);
  assert.match(config, /const googleAnalyticsId = "G-Z2FRK5MFMR"/);
  assert.match(config, /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=\$\{googleAnalyticsId\}/);
  assert.match(config, /tag: "script",[\s\S]*attrs: \{ async: true, src: googleTagUrl \}/);
  assert.match(config, /tag: "script",[\s\S]*content: googleTagBootstrap/);
  assert.match(config, /gtag\('config', '\$\{googleAnalyticsId\}'\);/);

  assert.match(headers, /script-src[^;]*https:\/\/\*\.googletagmanager\.com/);
  assert.match(headers, /img-src[^;]*https:\/\/\*\.google-analytics\.com/);
  assert.match(headers, /connect-src[^;]*https:\/\/\*\.analytics\.google\.com/);
  assert.match(productUi, /landing and every Starlight documentation page load Google Analytics/);
  assert.match(productUi, /G-Z2FRK5MFMR/);
  assert.match(productUi, /does not extend to the OAuth relay or customer-owned HQBase installations/);
  assert.doesNotMatch(cloudflareOauth, /G-Z2FRK5MFMR|googletagmanager/);
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
  assert.match(header, /ghbtns\.com\/github-btn\.html\?user=HQBase&repo=hqbase&type=star&count=true/);
  assert.match(header, /className="github-star-widget"/);
  assert.doesNotMatch(header, /frameBorder=|scrolling=/);
  assert.match(header, /width="76"/);
  assert.match(header, /height="20"/);
  assert.match(header, /<GitHubStarWidget \/>/);
  assert.match(header, /\{ label: "FAQ", href: "#faq" \}/);
  assert.doesNotMatch(header, /className="header-link" href={sourceUrl}>GitHub/);
  assert.doesNotMatch(header, /Get started|deployUrl|header-button|mobile-navigation-action/);
  assert.match(page, /<Header client:load \/>/);
  assert.match(page, /<WorkspaceMockup client:load \/>/);
  assert.match(page, /<FeaturesBento \/>/);
  assert.match(page, /<CommunityJourney \/>/);
  assert.match(page, /<FaqSection client:load \/>/);
  assert.match(page, /<nav class="footer-links" aria-label="Footer">[\s\S]*href="#faq">FAQ<\/a>/);
  assert.match(page, /Your team&apos;s email\./);
  assert.doesNotMatch(page, /Your team&apos;s workspace/);
  assert.match(page, /On your Cloudflare infrastructure\./);
  assert.match(page, /Free\. Open source\. Self-hosted\. Unlimited seats\./);
  assert.match(page, /<HeroActions client:load \/>/);
  assert.doesNotMatch(page, /<Button asChild/);
  assert.match(heroActions, /<DialogTrigger asChild>/);
  assert.match(heroActions, /className="hero-button hero-deploy-trigger"/);
  assert.match(heroActions, /<DialogContent className="deployment-dialog" showCloseButton={false}>/);
  assert.match(heroActions, /Ready for Cloudflare\?/);
  assert.match(heroActions, /Workers Paid enabled/);
  assert.match(heroActions, /R2 subscription active/);
  assert.match(heroActions, /Active Cloudflare DNS domain/);
  assert.match(heroActions, /developers\.cloudflare\.com\/workers\/platform\/pricing/);
  assert.match(heroActions, /developers\.cloudflare\.com\/fundamentals\/manage-domains\/add-site/);
  assert.match(heroActions, /Review Workers plans/);
  assert.match(heroActions, /Enable in Storage & databases \/ R2 \/ Overview/);
  assert.match(heroActions, /Add a domain/);
  assert.match(heroActions, /<DialogClose asChild>[\s\S]*Cancel/);
  assert.match(heroActions, /href={deployUrl}>[\s\S]*Confirm/);
  assert.match(heroActions, /className="hero-deploy-label">Deploy to Cloudflare/);
  assert.match(heroActions, /variant="outline"/);
  assert.match(heroActions, /href={deployUrl}/);
  assert.match(heroActions, /className="hero-button hero-docs-button"/);
  assert.match(heroActions, /href="\/docs\/"/);
  assert.match(heroActions, /<BookOpen data-icon="inline-start" \/>/);
  assert.match(heroActions, /Read docs/);
  assert.doesNotMatch(heroActions, /View source|sourceUrl|CodeXml/);
  assert.match(heroActions, /data-icon="inline-end"/);
  assert.match(heroActions, /data-icon="inline-start"/);
  assert.match(page, /href="\/docs\/"/);
  assert.match(styles, /\.site-header-nav/);
  assert.match(styles, /\.github-star-widget\s*\{[^}]*width: 4\.75rem[^}]*height: 1\.25rem[^}]*border: 0/);
  assert.match(styles, /\.desktop-navigation \.github-star-widget\s*\{[^}]*margin-inline-start: var\(--space-sm\)/);
  assert.match(styles, /\.dark \.github-star-widget\s*\{[^}]*filter: invert\(1\) hue-rotate\(180deg\)/);
  assert.doesNotMatch(styles, /\.site-header \.brand-logo\s*\{[^}]*translateY\(-1px\)/);
  assert.match(styles, /\.hero-title[\s\S]*line-height: 1\.08/);
  assert.match(styles, /\.hero-deploy-trigger\s*\{[^}]*min-height: 2\.75rem[^}]*2px solid var\(--color-cloudflare-orange\)[^}]*border-radius: 999px[^}]*linear-gradient\([^}]*110deg[^}]*var\(--color-cloudflare-amber\) 0%[^}]*var\(--color-cloudflare-coral\) 100%[^}]*background-position: 0% 50%[^}]*background-size: 240% 100%[^}]*color: var\(--color-cloudflare-black\)[^}]*background-position var\(--dur-long\) var\(--ease-out\)/);
  assert.match(styles, /\.hero-deploy-trigger:hover\s*\{[^}]*background-position: 100% 50%/);
  assert.match(styles, /\.dark \.hero-deploy-trigger\s*\{[^}]*background: var\(--color-cloudflare-black\)[^}]*color: var\(--color-cloudflare-coral\)/);
  assert.match(styles, /\.dark \.hero-deploy-label\s*\{[^}]*linear-gradient\([^}]*110deg[^}]*background-position: 0% 50%[^}]*background-size: 240% 100%[^}]*color: transparent[^}]*background-position var\(--dur-long\) var\(--ease-out\)/);
  assert.match(styles, /\.dark \.hero-deploy-trigger:hover \.hero-deploy-label\s*\{[^}]*background-position: 100% 50%/);
  assert.match(styles, /\.deployment-confirm-button\s*\{[^}]*linear-gradient\([^}]*110deg[^}]*background-position: 0% 50%[^}]*background-size: 240% 100%[^}]*background-position var\(--dur-long\) var\(--ease-out\)/);
  assert.match(styles, /\.deployment-confirm-button:hover\s*\{[^}]*background-position: 100% 50%/);
  assert.match(styles, /\.hero-docs-button\s*\{[^}]*min-height: 2\.75rem[^}]*border: 2px solid var\(--border-strong\)[^}]*border-radius: 999px[^}]*padding-inline: 1\.25rem[^}]*font-size: 0\.875rem/);
  assert.doesNotMatch(styles, /\[data-slot="button"\]\.hero-deploy-trigger/);
  assert.match(styles, /\.deployment-dialog\s*\{[\s\S]*width: min\(calc\(100vw - 2rem\), 34rem\)[\s\S]*border-radius: 1\.125rem[\s\S]*translate: none;[\s\S]*transform: translate\(-50%, -50%\)/);
  assert.match(styles, /\.deployment-dialog\[data-state="open"\] \.deployment-requirement:nth-child\(3\)[\s\S]*animation-delay: 320ms/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation-duration: 0\.01ms !important/);
  assert.match(styles, /\.feature-grid/);
  assert.match(styles, /\.site-footer/);
  assert.match(tokens, /--text-hero: clamp\(2\.375rem, 4\.5vw \+ 0\.4rem, 3\.75rem\)/);
  assert.match(tokens, /--space-section: clamp\(6rem, 12vw, 10\.5rem\)/);
  assert.match(tokens, /--color-cloudflare-orange: #f6821f/);
  assert.match(tokens, /--color-cloudflare-amber: #fbad41/);
  assert.match(tokens, /--color-cloudflare-coral: #ff6633/);
  assert.match(tokens, /--color-shadow: oklch\(0% 0 0 \/ 12%\)[\s\S]*\.dark[\s\S]*--color-shadow: oklch\(0% 0 0 \/ 42%\)/);
  assert.equal((page.match(/<footer/g) ?? []).length, 1);
  assert.doesNotMatch(page, /Pricing|Testimonials|HQBase Pro/i);
});

test("the hero keeps the live, scroll-linked workspace preview", async () => {
  const [page, mockup, styles] = await Promise.all([
    read("src/pages/index.astro"),
    read("src/components/workspace-mockup.tsx"),
    read("public/styles.css"),
  ]);

  assert.doesNotMatch(page, /hero-atmosphere|hero-glow-mark|hero-signal-grid/);
  assert.match(styles, /\.workspace-cloud-field[\s\S]*width: 100vw[\s\S]*transparent 80%[\s\S]*translateX\(-50%\)/);
  assert.match(styles, /\.workspace-cloud-dots[\s\S]*radial-gradient/);
  assert.match(styles, /\.browser-screen[\s\S]*aspect-ratio: 16 \/ 9/);
  assert.match(mockup, /HQBase interface rendered live at desktop and mobile layouts/i);
  assert.match(mockup, /workspace-live workspace-desktop/);
  assert.match(mockup, /workspace-live workspace-mobile/);
  assert.match(mockup, /<WorkspaceTopbar mobile \/>/);
  assert.match(mockup, /<ThreadRows mobile \/>/);
  assert.match(mockup, /className="mobile-preview"/);
  assert.match(mockup, /className="phone-hardware"/);
  assert.match(mockup, /className="workspace-perspective-stage"/);
  assert.match(mockup, /Launch assets for Friday/);
  assert.match(mockup, /count: 4/);
  assert.match(mockup, /Partner briefing/);
  assert.match(mockup, /Re: Support handoff/);
  assert.match(mockup, /the launch is scheduled and the team has the final files/);
  assert.match(mockup, /All mailboxes/);
  assert.match(styles, /\.workspace-thread-list\s*\{[^}]*display: flex[^}]*flex-direction: column/);
  assert.match(styles, /\.workspace-thread-rows\s*\{[^}]*flex: 1/);
  assert.match(styles, /\.workspace-thread-row\s*\{[^}]*min-height: 0[^}]*flex: 1/);
  assert.match(styles, /\.workspace-compose\s*\{[^}]*border-color: var\(--workspace-border\);[^}]*background: transparent;[^}]*color: var\(--workspace-primary\)/);
  assert.match(mockup, /window\.requestAnimationFrame\(render\)/);
  assert.match(mockup, /matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
  assert.doesNotMatch(mockup, /1 \+ easedProgress \* 0\.075/);
  assert.match(mockup, /restingPitch \* \(1 - easedProgress\)/);
  assert.match(mockup, /restingPhoneDepth \* \(1 - easedProgress\)/);
  assert.match(mockup, /restingStageLift \* \(1 - easedProgress\)/);
  assert.match(mockup, /headerHeightToken\.endsWith\("rem"\)/);
  assert.match(mockup, /headerHeightValue \* rootFontSize/);
  assert.match(mockup, /const finalViewportTop = headerHeight \+ 24/);
  assert.match(mockup, /const isMobile = window\.innerWidth < 768/);
  assert.match(mockup, /const motionWindow = viewportHeight \* \(isMobile \? 0\.34 : 0\.72\)/);
  assert.match(mockup, /const finalFollowDistance = isMobile[\s\S]*\? 0[\s\S]*finalScrollPosition \+ finalViewportTop - stageDocumentTop/);
  assert.match(mockup, /easedProgress \* finalFollowDistance/);
  assert.match(styles, /\.workspace-showcase\s*\{[\s\S]*--stage-lift: -5\.25rem;[\s\S]*--phone-preview-width: clamp\(5rem, 20vw, 16\.25rem\);[\s\S]*--phone-preview-overlap: clamp\(2\.5rem, 10vw, 8\.125rem\);[\s\S]*width: min\(86vw, 77\.5rem\);[\s\S]*height: clamp\(46rem, 65vw, 64rem\);[\s\S]*margin: clamp\(1\.25rem, 2\.5vw, 2rem\) 0 0/);
  assert.match(styles, /\.workspace-perspective-stage\s*\{[\s\S]*inset-inline-start: 50%;[\s\S]*width: 100%;[\s\S]*pointer-events: none;[\s\S]*rotateX\(var\(--stage-pitch\)\) scale\(var\(--desktop-scale\)\)/);
  assert.match(styles, /\.hero\s*\{[^}]*z-index: 2;[^}]*overflow: visible/);
  assert.match(styles, /translate3d\(-50%, calc\(var\(--desktop-y\) \+ var\(--stage-lift\)\), var\(--desktop-z\)\)/);
  assert.match(styles, /\.browser-window\s*\{[^}]*width: calc\(100% - var\(--phone-preview-overlap\)\)/);
  assert.match(styles, /\.mobile-preview\s*\{[^}]*inset-inline: auto 0[^}]*width: var\(--phone-preview-width\)/);
  assert.match(styles, /@media \(max-width: 47\.999rem\)[\s\S]*:root\s*\{[\s\S]*--page-gutter: 1\.5rem[\s\S]*--stage-lift: -2\.5rem;[\s\S]*--phone-preview-width: 24vw;[\s\S]*--phone-preview-overlap: 12vw;[\s\S]*width: 108vw;[\s\S]*height: clamp\(12rem, 52vw, 14rem\);[\s\S]*margin-block-start: var\(--space-md\);[\s\S]*\.workspace-perspective-stage\s*\{[\s\S]*inset-inline-start: 48%;[\s\S]*rotateX\(var\(--stage-pitch\)\)[\s\S]*\.mobile-preview\s*\{[\s\S]*width: var\(--phone-preview-width\);/);
  assert.match(styles, /@media \(max-width: 47\.999rem\)[\s\S]*\.feature-item\s*\{[\s\S]*padding-inline: 0/);
  assert.match(styles, /@media \(max-width: 47\.999rem\)[\s\S]*\.journey-step\s*\{[\s\S]*grid-template-columns: 1\.5rem minmax\(0, 1fr\)[\s\S]*\.journey-step:not\(:last-child\)::before\s*\{[\s\S]*inset-inline-start: calc\(1\.5rem \+ var\(--space-xs\)\)/);
  assert.doesNotMatch(styles, /--phone-preview-width: 48vw|--phone-preview-overlap: 24vw/);
  assert.match(styles, /\.phone-device\s*\{[^}]*--phone-frame-width: clamp\(0\.2rem, 0\.5vw, 0\.31rem\)[^}]*background: hsl\(0 0% 100%\)/);
  assert.match(styles, /\.dark \.phone-device\s*\{[^}]*background: hsl\(0 0% 3%\)/);
  assert.match(styles, /\.phone-hardware\s*\{[^}]*border: var\(--phone-frame-width\) solid[^}]*color-mix\(in oklch, var\(--color-ink\) 48%, var\(--color-paper\)\)/);
  assert.match(styles, /\.dark \.phone-hardware\s*\{[^}]*border-color: hsl\(0 0% 12%\)/);
  assert.match(styles, /\.phone-hardware::before\s*\{[^}]*inset-block-start: 1\.7%;[^}]*width: 34%;[^}]*height: 2\.65%/);
  assert.match(styles, /\.dark \.phone-hardware::before\s*\{[^}]*background: hsl\(0 0% 12%\)/);
  assert.match(styles, /\.phone-hardware::after\s*\{[^}]*color-mix\(in oklch, var\(--color-ink\) 42%, var\(--color-paper\)\)/);
  assert.match(styles, /\.dark \.phone-hardware::after\s*\{[^}]*background: hsl\(0 0% 18%\)/);
  assert.match(styles, /\.dark \.phone-device\s*\{[^}]*drop-shadow\(0 0\.5rem 1rem hsl\(0 0% 0% \/ 18%\)\)/);
  assert.match(styles, /\.dark \.workspace-cloud-field\s*\{[^}]*--cloud-dot-opacity: 0\.68/);
  assert.doesNotMatch(styles, /\.workspace-perspective-stage\s*\{[^}]*(?:rotateY|rotateZ)/);
  assert.doesNotMatch(styles, /\.phone-device\s*\{[^}]*rotateZ/);
  assert.doesNotMatch(styles, /@media \(max-width: 47\.999rem\)[\s\S]*\.browser-window\s*\{\s*display: none;/);
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
  assert.match(
    header,
    /\{ label: "Features", href: "#features" \}[\s\S]*\{ label: "FAQ", href: "#faq" \}[\s\S]*\{ label: "Docs", href: "\/docs\/" \}/,
  );
  assert.match(header, /useScroll\(10\)/);
  assert.match(header, /document\.body\.style\.overflow = open \? "hidden" : ""/);
  assert.match(header, /aria-expanded={open}/);
  assert.match(header, /event\.key === "Escape"/);
  assert.match(menuIcon, /stroke-dasharray/);
  assert.match(scrollHook, /window\.scrollY > threshold/);
  assert.match(styles, /\.site-header-scrolled \.site-header-nav,[\s\S]*border-radius: 999px/);
  const productUi = await read("src/content/docs/docs/specs/product-ui.md");
  assert.match(productUi, /compact navigation for[\s\S]*Features, FAQ, and Docs/);
  assert.match(productUi, /compact menu exposes the same links/);
  assert.match(productUi, /footer keeps brand context,[\s\S]*primary links including FAQ/);
});

test("features stay inside the documented product boundary", async () => {
  const [page, features, styles, tokens, productUi] = await Promise.all([
    read("src/pages/index.astro"),
    read("src/components/ui/features-bento.tsx"),
    read("public/styles.css"),
    read("tokens.css"),
    read("src/content/docs/docs/specs/product-ui.md"),
  ]);

  assert.match(page, /<FeaturesBento \/>/);
  assert.match(features, /Email that works for the whole team/);
  assert.match(features, /Share inboxes, manage access, and connect AI tools, while your mail stays in your Cloudflare account/);
  assert.doesNotMatch(features, /keep your mail and data/);
  assert.match(features, /Email via MCP/);
  assert.match(features, /icon: Bot,[\s\S]*title: "Email via MCP"/);
  assert.match(features, /Connect AI clients over OAuth to search, draft, reply, and send/);
  assert.match(features, /Bring all your domains and mailboxes into one place/);
  assert.match(features, /Give each team member access to their respective mailboxes/);
  assert.match(features, /Polished desktop and mobile PWA client with self hosted push notifications/);
  assert.match(features, /Worker, D1 mail index, and R2 attachments stay yours/);
  assert.match(features, /Verify every release, back up first, and roll back/);
  assert.doesNotMatch(features, /from "@\/components\/ui\/card"/);
  assert.doesNotMatch(features, /React\.useEffect|requestAnimationFrame|addEventListener|sectionRef/);
  assert.match(features, /<article className="feature-item" data-reveal="up" key={title}>/);
  assert.doesNotMatch(features, /handleCardPointerMove|resetCardPointer/);
  assert.match(features, /<header className="feature-item-heading">/);
  assert.match(features, /className="feature-icon-mark" aria-hidden="true"/);
  assert.doesNotMatch(features, /feature-icon-field|feature-icon-grid/);
  assert.doesNotMatch(features, /Card|feature-card/);
  assert.doesNotMatch(features, /features-atmosphere|feature-icon-tile/);
  assert.match(styles, /\.features-heading[\s\S]*text-align: center/);
  assert.match(styles, /\.features-section > \.page-shell\s*\{[^}]*var\(--layout-features\)/);
  assert.match(styles, /\.feature-grid\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\)[^}]*gap: 0/);
  assert.match(styles, /\.feature-item\s*\{[^}]*--feature-edge-top: var\(--color-feature-rule\)[^}]*--feature-edge-left: transparent[^}]*min-height: 10\.5rem/);
  assert.match(styles, /\.feature-item::before[\s\S]*var\(--feature-edge-top\)[\s\S]*var\(--feature-edge-left\)[\s\S]*0\.375rem 1rem[\s\S]*mask:/);
  assert.doesNotMatch(styles, /\.feature-item\s*\{[^}]*(?:background-color|border-radius|box-shadow|backdrop-filter)/);
  assert.match(styles, /\.feature-item:first-child\s*\{[^}]*--feature-edge-top: transparent/);
  assert.doesNotMatch(styles, /feature-edge-right|feature-edge-bottom/);
  assert.match(styles, /@media \(min-width: 48rem\)[\s\S]*\.feature-item:nth-child\(-n \+ 2\)[\s\S]*--feature-edge-top: transparent/);
  assert.match(styles, /\.feature-item:nth-child\(2n\)\s*\{[^}]*--feature-edge-left: var\(--color-feature-rule\)/);
  assert.match(styles, /@media \(min-width: 64rem\)[\s\S]*\.feature-item:nth-child\(3n \+ 2\),[\s\S]*\.feature-item:nth-child\(3n\)[\s\S]*--feature-edge-left: var\(--color-feature-rule\)/);
  assert.match(styles, /\.feature-item-heading\s*\{[^}]*display: flex[^}]*align-items: center/);
  assert.doesNotMatch(styles, /feature-icon-field|feature-icon-grid/);
  assert.match(styles, /\.feature-icon-mark\s*\{[^}]*width: 1\.5rem[^}]*color: var\(--color-accent\)[^}]*stroke-width: 1\.7/);
  assert.doesNotMatch(styles, /\.feature-item:hover|--feature-card-lift/);
  assert.doesNotMatch(styles, /color-feature-grid-light|color-feature-shine/);
  assert.match(styles, /\.features-heading > p[\s\S]*font-size: 0\.9375rem/);
  assert.match(styles, /@media \(min-width: 64rem\)[\s\S]*\.features-heading h2[\s\S]*white-space: nowrap/);
  assert.match(styles, /\.feature-item-heading h3[\s\S]*1\.0625rem[\s\S]*1\.1875rem/);
  assert.match(styles, /\.feature-item > p[\s\S]*font-size: 0\.9375rem/);
  assert.doesNotMatch(styles, /\.feature-item\s*\{[^}]*\btransition:/);
  assert.doesNotMatch(styles, /\.feature-icon-mark\s*\{[^}]*\btransition:/);
  assert.doesNotMatch(styles, /feature-card-rotate/);
  assert.doesNotMatch(styles, /\.feature-item\s*\{[^}]*rotate[XY]\(/);
  assert.doesNotMatch(styles, /features-atmosphere|features-scroll|features-matter/);
  assert.doesNotMatch(styles, /feature-shader-flow/);
  assert.doesNotMatch(features, /eyebrow|kicker|Preview/);
  assert.doesNotMatch(styles, /feature-bento|feature-tool-cycle|features-kicker/);
  assert.doesNotMatch(features, /free trial|license key|HQBase Pro|Community/i);
  assert.match(tokens, /--color-feature-rule: oklch\(64% 0\.21 43 \/ 22%\)/);
  assert.match(tokens, /--rule-feature: 3px/);
  assert.match(tokens, /--layout-features: 82rem/);
  assert.match(productUi, /six flat grid cells/);
  assert.match(productUi, /Subtle orange rules use three-pixel, widely spaced dashes/);
  assert.match(productUi, /match the visual weight of the background dots/);
  assert.match(productUi, /leaving the matrix edges open/);
  assert.match(productUi, /slightly larger[\s\S]*orange Lucide icons inline with each title/);
  assert.match(productUi, /icon backdrop/);
  assert.match(productUi, /feature rows add no second horizontal inset[\s\S]*icon and text axes aligned with[\s\S]*roadmap marker and milestone text axes/);
});

test("the public journey links milestones to the HQBase community", async () => {
  const [page, journey, map, styles, productUi] = await Promise.all([
    read("src/pages/index.astro"),
    read("src/components/community-journey.tsx"),
    read("src/components/community-map.tsx"),
    read("public/styles.css"),
    read("src/content/docs/docs/specs/product-ui.md"),
  ]);

  assert.match(page, /<CommunityJourney \/>/);
  assert.match(journey, /We're building the workspace OS on Cloudflare\./);
  assert.doesNotMatch(journey, /Our mission|journey-label|Free\. Open source\. Self-hosted\. Unlimited seats\./);
  assert.match(journey, /Team email today, with more of your team's work coming together\./);
  assert.match(journey, /Project started/);
  assert.match(journey, /HQBase v1 release/);
  assert.match(journey, /August 8, 2026/);
  assert.match(journey, /Community feedback/);
  assert.match(journey, /Share ideas, ask questions, and request features/);
  assert.match(journey, /Next release/);
  assert.match(journey, /https:\/\/github\.com\/HQBase\/hqbase/);
  assert.match(journey, /https:\/\/github\.com\/orgs\/HQBase\/discussions/);
  assert.match(journey, /<Button asChild className="journey-community-button" size="lg">/);
  assert.match(journey, /<Star data-icon="inline-start" \/>/);
  assert.match(journey, /Star the repo/);
  assert.match(journey, /variant="outline"/);
  assert.match(journey, /<MessagesSquare data-icon="inline-start" \/>/);
  assert.match(journey, /Join the discussion/);
  assert.match(journey, /<CommunityMap \/>/);
  assert.match(map, /id="community-map-dots"/);
  assert.match(map, /aria-hidden="true"/);
  assert.match(map, /focusable="false"/);
  assert.doesNotMatch(map, /<img|https?:\/\//);
  assert.doesNotMatch(journey, /journey-community-points|<Card|CardHeader|CardContent/);
  assert.match(journey, /Follow the journey/);
  assert.doesNotMatch(journey, /Public roadmap|Milestones, shared as they happen|2 of 4 complete/);
  assert.match(journey, /<Badge variant="secondary">{label}<\/Badge>/);
  assert.doesNotMatch(journey, /<Badge variant="outline"|state === "upcoming" \? "outline"/);
  assert.match(journey, /aria-current={state === "current" \? "step" : undefined}/);
  assert.match(styles, /\.journey-layout[\s\S]*grid-template-areas:[\s\S]*"copy"[\s\S]*"timeline"[\s\S]*gap: clamp\(4\.5rem, 9vw, 7\.5rem\)/);
  assert.match(styles, /\.hero\s*\{[^}]*padding-block: clamp\(8\.5rem, 18vh, 11rem\) 0/);
  assert.match(styles, /\.workspace-showcase\s*\{[^}]*width: min\(86vw, 77\.5rem\)[^}]*padding: 0/);
  assert.match(styles, /\.features-section\s*\{[^}]*padding-block: var\(--space-section\) 0/);
  assert.match(styles, /\.journey-section\s*\{[^}]*padding-block: var\(--space-section\)/);
  assert.match(styles, /@media \(min-width: 64rem\)[\s\S]*grid-template-areas: "copy timeline"/);
  assert.doesNotMatch(styles, /\.journey-timeline\s*\{[^}]*border-block/);
  assert.doesNotMatch(styles, /\.journey-step:not\(:last-child\)\s*\{[^}]*border-block-end/);
  assert.match(styles, /\.journey-step:not\(:last-child\)::before\s*\{[^}]*height: var\(--rule-thin\)[^}]*inset-inline: calc\(1\.125rem \+ var\(--space-xs\)\) 0[^}]*background: var\(--color-rule\)[^}]*mask-image: linear-gradient\([^}]*transparent[^}]*14%[^}]*86%[^}]*transparent/);
  assert.match(styles, /\.journey-step-heading \[data-slot="badge"\][\s\S]*font-size: 0\.6875rem/);
  assert.doesNotMatch(styles, /\.journey-step-heading \[data-slot="badge"\][^}]*text-transform: uppercase/);
  assert.match(styles, /\.journey-marker \{[\s\S]*width: 1\.125rem;[\s\S]*height: 1\.125rem/);
  assert.match(styles, /\.journey-step\[data-state="upcoming"\] \.journey-marker\s*\{[^}]*border-color: color-mix\(in oklch, var\(--color-muted\) 50%, var\(--color-paper\)\)[^}]*color: color-mix\(in oklch, var\(--color-muted\) 72%, var\(--color-paper\)\)/);
  assert.match(styles, /\.journey-section > \.page-shell \{[\s\S]*position: relative;[\s\S]*z-index: 1;[\s\S]*width: min\(100%, var\(--layout-features\)\)/);
  assert.match(styles, /\.journey-step\s*\{[^}]*min-height: 6\.25rem;[^}]*padding-block: 1\.5rem/);
  assert.match(styles, /\.journey-map \{[\s\S]*position: absolute;[\s\S]*inset: 0;[\s\S]*height: 100%;[\s\S]*color: var\(--color-accent\);[\s\S]*mask-image:/);
  assert.doesNotMatch(styles, /\[data-slot="card"\]\.journey-timeline-panel|\.journey-timeline-panel\s*\{[^}]*(?:background|box-shadow|border-radius)/);
  assert.match(productUi, /The public journey pairs an open, unframed milestone timeline with a concise mission statement/);
  assert.match(productUi, /GitHub Discussions forum/);
  assert.match(productUi, /product principles[\s\S]*sit directly below the hero title/);
  assert.match(productUi, /without a[\s\S]*separate eyebrow label/);
  assert.match(productUi, /sentence-case status badges all use quiet neutral backgrounds/);
  assert.match(productUi, /Planned milestone markers use a clearly visible muted neutral/);
  assert.match(productUi, /separators between milestones but no top or[\s\S]*bottom border/);
  assert.match(productUi, /separator begins after the marker[\s\S]*does not cross the vertical timeline[\s\S]*fades at both ends/);
  assert.match(productUi, /decorative, low-contrast dotted world map sits behind the community/);
  assert.match(productUi, /section background rather than extending the page below it/);
  assert.match(productUi, /one shared responsive section gap/);
  assert.match(productUi, /do not stack bottom and top padding/);
  assert.match(productUi, /one shared, slightly roomy horizontal gutter for the header, hero copy,[\s\S]*features, public journey, and footer/);
  assert.match(productUi, /deliberate full-bleed exception/);
  assert.match(productUi, /complete the flattening motion sooner[\s\S]*avoiding an empty spacer below it/);
});

test("the landing answers common questions with the native shadcn accordion", async () => {
  const [page, faq, accordion, styles, productUi] = await Promise.all([
    read("src/pages/index.astro"),
    read("src/components/faq-section.tsx"),
    read("src/components/ui/accordion.tsx"),
    read("public/styles.css"),
    read("src/content/docs/docs/specs/product-ui.md"),
  ]);

  assert.match(page, /import \{ FaqSection \} from "@\/components\/faq-section"/);
  assert.match(page, /<FaqSection client:load \/>/);
  assert.match(faq, /from "@\/components\/ui\/accordion"/);
  assert.match(faq, /type="single"/);
  assert.match(faq, /collapsible/);
  assert.match(faq, /defaultValue="deployment-requirements"/);
  assert.equal((faq.match(/question: "/g) ?? []).length, 4);
  assert.match(
    faq,
    /question: "What do I need before deploying\?"[\s\S]*question: "How is HQBase different from Cloudflare Agentic Inbox\?"[\s\S]*question: "Where does my data live\?"[\s\S]*question: "Is HQBase fully free and open source\?"/,
  );
  assert.match(faq, /How is HQBase different from Cloudflare Agentic Inbox\?/);
  assert.match(faq, /Is HQBase fully free and open source\?/);
  assert.match(faq, /Where does my data live\?/);
  assert.match(faq, /What do I need before deploying\?/);
  assert.doesNotMatch(faq, /What is HQBase\?|Can I connect AI tools to HQBase\?/);
  assert.match(faq, /They share a similar foundation: self-hosted email on Cloudflare with AI support/);
  assert.match(faq, /complete team email workspace/);
  assert.match(faq, /individual accounts,[\s\S]*per-mailbox permissions,[\s\S]*OAuth-scoped AI access/);
  assert.match(faq, /Web Push, audit history, multi-domain[\s\S]*administration/);
  assert.match(faq, /signed updates with backup and recovery/);
  assert.match(faq, /We encourage you to try[\s\S]*Agentic Inbox as well/);
  assert.match(faq, /deployment is not registered with us[\s\S]*not even[\s\S]*aware that your installation exists/);
  assert.match(faq, /complete HQBase product, including its OAuth relay[\s\S]*AGPL-3\.0-only/);
  assert.match(faq, /no per-seat fees/);
  assert.match(faq, /AGPL-3\.0-only/);
  assert.match(faq, /Workers Paid/);
  assert.match(faq, /active domain using[\s\S]*Cloudflare DNS/);
  assert.match(faq, /href="\/docs\/getting-started\/"/);
  assert.match(faq, /Still have a question\?/);
  assert.match(faq, /Ask the HQBase community on GitHub\./);
  assert.match(faq, /https:\/\/github\.com\/orgs\/HQBase\/discussions/);
  assert.match(faq, /data-reveal="up"/);
  assert.match(faq, /suppressHydrationWarning/);
  assert.match(accordion, /data-open:animate-accordion-down/);
  assert.match(accordion, /data-closed:animate-accordion-up/);
  assert.match(styles, /\.faq-section\s*\{[^}]*padding-block: 0 var\(--space-section\)/);
  assert.match(styles, /\.faq-section > \.page-shell\s*\{[^}]*width: min\(100%, 54rem\)/);
  assert.match(styles, /\.faq-accordion \[data-slot="accordion-item"\]:not\(:last-child\)::after[\s\S]*mask-image: linear-gradient/);
  assert.match(styles, /\.faq-accordion \[data-slot="accordion-content"\] p\s*\{[^}]*max-width: none/);
  assert.match(styles, /\.faq-heading\s*\{[^}]*margin-inline: auto;[^}]*text-align: center/);
  assert.match(styles, /\.faq-community\s*\{[^}]*text-align: center/);
  assert.doesNotMatch(faq, /faq-number|padStart/);
  assert.doesNotMatch(styles, /\.faq-number|\.faq-layout\s*\{[^}]*grid-template-columns/);
  assert.match(productUi, /FAQ follows the public journey[\s\S]*source-owned shadcn Accordion/);
  assert.match(productUi, /contains exactly four questions/);
  assert.match(productUi, /what Cloudflare preparation deployment requires[\s\S]*in that order/);
  assert.match(productUi, /deployment preparation answer open by default/);
  assert.match(productUi, /how HQBase differs from Cloudflare Agentic Inbox/);
  assert.match(productUi, /shared foundation of self-hosted email on Cloudflare with AI support/);
  assert.match(
    productUi,
    /individual[\s\S]*accounts,[\s\S]*per-mailbox permissions,[\s\S]*OAuth-scoped AI access/,
  );
  assert.match(productUi, /encouraging people to try[\s\S]*Agentic Inbox as well/);
  assert.match(productUi, /deployments[\s\S]*are not registered with HQBase[\s\S]*not aware that an installation exists/);
  assert.match(productUi, /complete product, including its OAuth relay[\s\S]*AGPL-3\.0-only/);
  assert.match(productUi, /no per-seat fees/);
  assert.match(productUi, /answer copy use almost the full accordion width/);
  assert.match(productUi, /heading centered above the accordion[\s\S]*as one reading column/);
  assert.match(productUi, /without[\s\S]*question numbers or a split desktop layout/);
  assert.match(productUi, /Below the accordion[\s\S]*HQBase GitHub Discussions community/);
});

test("the landing reveals content progressively without hiding reduced-motion visitors", async () => {
  const [page, mockup, features, journey, reveal, styles, productUi] = await Promise.all([
    read("src/pages/index.astro"),
    read("src/components/workspace-mockup.tsx"),
    read("src/components/ui/features-bento.tsx"),
    read("src/components/community-journey.tsx"),
    read("public/reveal.js"),
    read("public/styles.css"),
    read("src/content/docs/docs/specs/product-ui.md"),
  ]);

  assert.match(page, /<script is:inline src="\/reveal\.js" defer><\/script>/);
  assert.match(page, /class="hero-copy" data-reveal="up"/);
  assert.match(page, /class="page-shell" data-reveal="up"/);
  assert.match(mockup, /className="workspace-showcase"[\s\S]*data-reveal="fade"[\s\S]*suppressHydrationWarning/);
  assert.match(features, /className="features-heading" data-reveal="up"/);
  assert.match(features, /className="feature-item" data-reveal="up"/);
  assert.match(journey, /className="journey-copy" data-reveal="left"/);
  assert.match(journey, /className="journey-timeline-header" data-reveal="up"/);
  assert.match(journey, /className="journey-step"[\s\S]*data-reveal="right"/);
  assert.match(reveal, /matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
  assert.match(reveal, /"IntersectionObserver" in window/);
  assert.match(reveal, /observer\.unobserve\(element\)/);
  assert.match(reveal, /root\.classList\.add\("reveal-motion"\)/);
  assert.match(reveal, /element\.classList\.add\("is-revealed"\)/);
  assert.match(reveal, /root\.classList\.remove\("reveal-motion"\)/);
  assert.match(styles, /html\.reveal-motion \[data-reveal\]\s*\{[^}]*opacity: 0[^}]*filter: blur\(0\.1875rem\)[^}]*transition:/);
  assert.match(styles, /html\.reveal-motion \[data-reveal\]\.is-revealed\s*\{[^}]*opacity: 1[^}]*filter: blur\(0\)[^}]*transform: none/);
  assert.match(styles, /\.feature-item:nth-child\(3n \+ 2\)\s*\{[^}]*--reveal-delay: 90ms/);
  assert.match(styles, /\.journey-step:nth-child\(4\)\s*\{[^}]*--reveal-delay: 260ms/);
  assert.match(productUi, /short,[\s\S]*one-time entrance motion as they enter the viewport/);
  assert.match(productUi, /Content remains visible without JavaScript/);
  assert.match(productUi, /reduced-motion visitors see[\s\S]*complete static page/);
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
    "src/components/ui/accordion.tsx",
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
  assert.match(headers, /script-src[^;]*https:\/\/\*\.googletagmanager\.com/);
  assert.match(headers, /img-src[^;]*https:\/\/deploy\.workers\.cloudflare\.com/);
  assert.match(headers, /img-src[^;]*https:\/\/\*\.google-analytics\.com/);
  assert.match(headers, /connect-src[^;]*https:\/\/\*\.google-analytics\.com/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /frame-src https:\/\/ghbtns\.com/);
  assert.match(headers, /Strict-Transport-Security:/);
});
