export const fallbackReleases = [
  {
    tagName: "v1.1.1",
    name: "HQBase 1.1.1",
    url: "https://github.com/HQBase/hqbase/releases/tag/v1.1.1",
    publishedAt: "2026-08-16T00:51:33Z",
    prerelease: false,
    bodyHtml: `<ul>
<li>Publish the deployment-local Mail API instructions as a valid Agent Skill at<br>
<code>/skills/hqbase-mail/SKILL.md</code>, add Copy and Download Skill actions, and redirect the earlier<br>
<code>/AGENTS.md</code> and <code>/agents.md</code> paths.</li>
</ul>`,
  },
  {
    tagName: "v1.1.0",
    name: "HQBase 1.1.0",
    url: "https://github.com/HQBase/hqbase/releases/tag/v1.1.0",
    publishedAt: "2026-08-15T19:42:07Z",
    prerelease: false,
    bodyHtml: `<ul>
<li>Add a stable, versioned Mail API for mailboxes, messages, conversations, attachments, drafts,<br>
sending, and replies. API clients can use audience-bound OAuth bearer tokens, while the web app<br>
uses the same <code>/api/v1</code> routes with its existing session cookie.</li>
<li>Publish deployment-local <code>AGENTS.md</code>, OpenAPI 3.1, and Postman artifacts so people and AI agents<br>
can discover, inspect, and test each installation's API without an HQBase-specific SDK.</li>
<li>Add OAuth Device Authorization for agents and command-line clients, including normal-browser<br>
approval, short-lived single-use codes, scoped access, and persistent D1-backed verification<br>
rate limits.</li>
<li>Expand <strong>Connect AI agent</strong> to offer both the existing MCP connection and the deployment's<br>
<code>AGENTS.md</code> instructions, while keeping REST and MCP tokens isolated by audience.</li>
<li>Add deterministic local D1 reset and seed commands for a ready-to-use development workspace.</li>
<li>Improve Windows installation and release-script compatibility, protect temporary secret files,<br>
route Worker-owned paths ahead of the SPA fallback, and exercise the quality gate on Windows CI.</li>
</ul>`,
  },
  {
    tagName: "v1.0.1",
    name: "HQBase 1.0.1",
    url: "https://github.com/HQBase/hqbase/releases/tag/v1.0.1",
    publishedAt: "2026-08-10T23:58:58Z",
    prerelease: false,
    bodyHtml: `<ul>
<li>Preserve invitation password setup links so <code>/set-password?token=...</code> reaches the password form<br>
instead of being normalized to the inbox.</li>
</ul>`,
  },
  {
    tagName: "v1.0.0",
    name: "HQBase 1.0.0",
    url: "https://github.com/HQBase/hqbase/releases/tag/v1.0.0",
    publishedAt: "2026-08-08T23:01:46Z",
    prerelease: false,
    bodyHtml: `<ul>
<li>Publish HQBase as one free and open-source shared email workspace for customer-owned Cloudflare<br>
infrastructure, with one signed public release and update channel.</li>
<li>Support multiple email domains, shared mailboxes, aliases, catch-all delivery, drafts,<br>
conversations, replies, forwarding, attachments, and Gmail-compatible quoted history.</li>
<li>Enforce owner, admin, member, and mailbox-level read, agent, and manager access throughout the app<br>
and OAuth-protected MCP endpoints.</li>
<li>Provide responsive desktop, mobile, and installable PWA experiences with mailbox filtering,<br>
notifications, offline handling, update readiness, and device-safe layouts.</li>
<li>Keep setup, domain management, updates, backup, restore, diagnostics, and resource removal inside<br>
the customer Cloudflare account.</li>
<li>Use the verified public Cloudflare OAuth client by default and support private customer-managed<br>
OAuth clients with Authorization Code and PKCE, without client secrets or pasted API tokens.</li>
<li>Verify signed release manifests and artifact digests before deployment, with compatibility<br>
checks, D1 recovery bookmarks, Worker rollback details, and staging lifecycle coverage.</li>
</ul>`,
  },
]
