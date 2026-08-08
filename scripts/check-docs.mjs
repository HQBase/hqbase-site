import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = path.join(root, "src", "content", "docs", "docs");
const sidebarFile = path.join(root, "astro.config.mjs");
const markdownExtensions = new Set([".md", ".mdx"]);
const failures = [];

const migratedContentFloors = new Map([
  ["access-control.md", 550],
  ["architecture.md", 300],
  ["getting-started.md", 270],
  ["mcp.md", 620],
  ["operations.md", 350],
  ["guides/cloudflare-email-setup.md", 538],
  ["guides/deployment.md", 330],
  ["guides/updates.md", 340],
  ["maintainers/contributing.md", 500],
  ["maintainers/engineering-standards.md", 700],
  ["maintainers/releases.md", 390],
  ["maintainers/staging-e2e.md", 295],
  ["specs/cloudflare-oauth.md", 775],
  ["specs/composer.md", 775],
  ["specs/multi-domain.md", 330],
  ["specs/product-ui.md", 3000],
  ["specs/product.md", 210],
]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return entry.isFile() && markdownExtensions.has(path.extname(entry.name)) ? [absolute] : [];
  });
}

function publicRoute(relative) {
  const extension = path.extname(relative);
  const slug = relative.slice(0, -extension.length).split(path.sep).join("/");
  if (slug === "index") return "/docs/";
  if (slug.endsWith("/index")) return `/docs/${slug.slice(0, -"/index".length)}/`;
  return `/docs/${slug}/`;
}

function linkPath(rawTarget) {
  const withoutHeading = rawTarget
    .split("#", 1)[0]
    .split("?", 1)[0]
    .trim()
    .replace(/^<|>$/g, "");
  if (!withoutHeading) return null;

  try {
    return decodeURIComponent(withoutHeading);
  } catch {
    return null;
  }
}

const docsFiles = walk(docsRoot);
const docsRoutes = new Set(docsFiles.map((file) => publicRoute(path.relative(docsRoot, file))));
const sidebar = fs.readFileSync(sidebarFile, "utf8");

for (const file of docsFiles) {
  const content = fs.readFileSync(file, "utf8");
  const relative = path.relative(docsRoot, file);
  const extension = path.extname(relative);
  const slug = relative.slice(0, -extension.length).split(path.sep).join("/");

  if (!/^---\n[\s\S]*?^title:\s*\S/m.test(content)) {
    failures.push(`${relative}: missing Starlight title frontmatter`);
  }
  if (/^updated:/m.test(content)) {
    failures.push(`${relative}: manual updated metadata is not allowed; use Git history`);
  }
  if (/^(?:status|visibility):/m.test(content) || /^> \*\*Status:\*\*/m.test(content)) {
    failures.push(`${relative}: publish only current public docs; remove lifecycle labels`);
  }
  if (/^\s+text:\s+(?:Active|Draft|Deprecated|Superseded)\s*$/m.test(content)) {
    failures.push(`${relative}: documentation lifecycle badges are not used`);
  }
  if (
    (relative.startsWith("specs/") || relative.startsWith("maintainers/")) &&
    /^\s+badge:/m.test(content)
  ) {
    failures.push(`${relative}: specifications and maintainer pages do not use lifecycle badges`);
  }
  if (content.includes("[[")) {
    failures.push(`${relative}: Obsidian wikilinks are not supported; use Markdown links`);
  }

  for (const match of content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].trim();
    if (/^(?:https?:|mailto:|tel:|#)/.test(target)) continue;

    const targetPath = linkPath(target);
    if (!targetPath) {
      failures.push(`${relative}: invalid link ${target}`);
      continue;
    }

    if (targetPath === "/docs" || targetPath.startsWith("/docs/")) {
      const normalizedRoute = targetPath === "/docs" ? "/docs/" : targetPath;
      if (!docsRoutes.has(normalizedRoute)) {
        failures.push(`${relative}: missing public documentation route ${normalizedRoute}`);
      }
      continue;
    }

    if (targetPath.startsWith("/")) continue;

    if (match[0].startsWith("!")) {
      const resolved = path.normalize(path.resolve(path.dirname(file), targetPath));
      if (!fs.existsSync(resolved)) failures.push(`${relative}: missing image ${target}`);
      continue;
    }

    failures.push(
      `${relative}: internal link ${target} must use its published /docs/.../ route`,
    );
  }

  const sidebarSlug = slug.endsWith("/index") ? slug.slice(0, -"/index".length) : slug;
  const sidebarReference =
    sidebarSlug === "index" ? '{ slug: "docs"' : `docsSlug("${sidebarSlug}")`;
  if (!sidebar.includes(sidebarReference)) {
    failures.push(`${relative}: missing from the Starlight sidebar`);
  }

  const minimumWords = migratedContentFloors.get(relative);
  if (minimumWords) {
    const wordCount = content.match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g)?.length ?? 0;
    if (wordCount < minimumWords) {
      failures.push(
        `${relative}: ${wordCount} words is below the migrated-content floor of ${minimumWords}`,
      );
    }
  }
}

for (const expected of migratedContentFloors.keys()) {
  if (!fs.existsSync(path.join(docsRoot, expected))) {
    failures.push(`${expected}: migrated document is missing`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${docsFiles.length} public documentation pages, navigation entries, and content floors.`,
);
