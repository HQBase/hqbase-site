import path from "node:path"

import react from "@astrojs/react"
import starlight from "@astrojs/starlight"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"

const root = import.meta.dirname
const repositoryUrl = "https://github.com/HQBase/hqbase"
const discordUrl = "https://discord.gg/U67PB663nf"
const docsSlug = (slug) => `docs/${slug}`
const googleAnalyticsId = "G-Z2FRK5MFMR"
const googleTagUrl = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`
const googleTagBootstrap = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}');
`

export default defineConfig({
  site: "https://hqbase.io",
  devToolbar: {
    enabled: false,
  },
  integrations: [
    react(),
    starlight({
      title: "HQBase Docs",
      description:
        "Install and operate HQBase, the self-hosted team email workspace for Cloudflare.",
      customCss: ["./src/styles/starlight.css"],
      components: {
        Sidebar: "./src/components/starlight-sidebar.astro",
        ThemeSelect: "./src/components/starlight-theme-toggle.astro",
      },
      disable404Route: true,
      editLink: {
        baseUrl: "https://github.com/HQBase/hqbase-site/edit/main/",
      },
      favicon: "/favicon.svg",
      head: [
        {
          tag: "meta",
          attrs: { name: "theme-color", content: "#111113" },
        },
        {
          tag: "script",
          attrs: { async: true, src: googleTagUrl },
        },
        {
          tag: "script",
          content: googleTagBootstrap,
        },
      ],
      sidebar: [
        {
          label: "Start",
          items: [
            { slug: "docs", label: "Overview" },
            { slug: docsSlug("getting-started") },
          ],
        },
        {
          label: "Using HQBase",
          items: [
            { slug: docsSlug("architecture") },
            { slug: docsSlug("access-control") },
            { slug: docsSlug("mcp") },
            { slug: docsSlug("operations") },
            { slug: docsSlug("guides/cloudflare-email-setup") },
            { slug: docsSlug("guides/deployment") },
            { slug: docsSlug("guides/customer-managed-oauth") },
            { slug: docsSlug("guides/updates") },
          ],
        },
        {
          label: "Product reference",
          collapsed: true,
          items: [
            { slug: docsSlug("specs/product") },
            { slug: docsSlug("specs/multi-domain") },
            { slug: docsSlug("specs/composer") },
            { slug: docsSlug("specs/mail-api") },
            { slug: docsSlug("specs/cloudflare-oauth") },
            { slug: docsSlug("specs/product-ui") },
          ],
        },
        {
          label: "For maintainers",
          collapsed: true,
          items: [
            { slug: docsSlug("maintainers"), label: "Overview" },
            { slug: docsSlug("maintainers/contributing") },
            { slug: docsSlug("maintainers/documentation") },
            { slug: docsSlug("maintainers/engineering-standards") },
            { slug: docsSlug("maintainers/staging-e2e") },
            { slug: docsSlug("maintainers/releases") },
          ],
        },
        { slug: docsSlug("changelog"), label: "Changelog" },
      ],
      social: [
        { icon: "discord", label: "Discord", href: discordUrl },
        { icon: "github", label: "GitHub", href: repositoryUrl },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(root, "./src"),
      },
    },
    server: {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  },
})
