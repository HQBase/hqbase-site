import { fallbackReleases } from "../data/github-releases.mjs"

export const releasesApiUrl =
  "https://api.github.com/repos/HQBase/hqbase/releases?per_page=20"

const releasesUrlPrefix = "https://github.com/HQBase/hqbase/releases/tag/"
const safeBodyFallback = "<p>Read the complete release notes on GitHub.</p>"

function copyFallbackReleases() {
  return fallbackReleases.map((release) => ({ ...release }))
}

function safeReleaseBodyHtml(value) {
  if (typeof value !== "string" || value.trim() === "") return safeBodyFallback

  const hasUnsafeElement = /<(?:script|style|iframe|object|embed|form|input|button|textarea|select)\b/i
  const hasEventHandler = /\son[a-z]+\s*=/i
  const hasUnsafeProtocol = /(?:href|src)\s*=\s*["']?\s*(?:javascript|data):/i

  if (
    hasUnsafeElement.test(value) ||
    hasEventHandler.test(value) ||
    hasUnsafeProtocol.test(value)
  ) {
    return safeBodyFallback
  }

  return value
}

function normalizeRelease(value) {
  if (!value || typeof value !== "object" || value.draft === true) return null

  const tagName = typeof value.tag_name === "string" ? value.tag_name : ""
  const url = typeof value.html_url === "string" ? value.html_url : ""
  const publishedAt = typeof value.published_at === "string" ? value.published_at : ""
  const publishedTime = Date.parse(publishedAt)

  if (
    !/^v[0-9A-Za-z.-]+$/.test(tagName) ||
    !url.startsWith(releasesUrlPrefix) ||
    !Number.isFinite(publishedTime)
  ) {
    return null
  }

  return {
    tagName,
    name:
      typeof value.name === "string" && value.name.trim() !== "" ? value.name : tagName,
    url,
    publishedAt,
    prerelease: value.prerelease === true,
    bodyHtml: safeReleaseBodyHtml(value.body_html),
  }
}

export async function getGitHubReleases({
  fetchImpl = globalThis.fetch,
  token = process.env.GITHUB_TOKEN,
  timeoutMs = 5_000,
  logger = console,
} = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const headers = {
    Accept: "application/vnd.github.html+json",
    "User-Agent": "hqbase-site-changelog",
    "X-GitHub-Api-Version": "2022-11-28",
  }

  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const response = await fetchImpl(releasesApiUrl, {
      headers,
      signal: controller.signal,
    })

    if (!response.ok) throw new Error(`GitHub returned ${response.status}`)

    const payload = await response.json()
    const releases = Array.isArray(payload)
      ? payload.map(normalizeRelease).filter((release) => release !== null)
      : []

    if (releases.length === 0) throw new Error("GitHub returned no published releases")

    return releases.sort(
      (left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt),
    )
  } catch (error) {
    logger?.warn?.(
      `Could not refresh the GitHub release feed; using the checked-in snapshot. ${error instanceof Error ? error.message : "Unknown error"}`,
    )
    return copyFallbackReleases()
  } finally {
    clearTimeout(timeout)
  }
}
