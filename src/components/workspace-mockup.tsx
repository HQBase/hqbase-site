import * as React from "react"
import type { LucideIcon } from "lucide-react"
import {
  Archive,
  Cable,
  ChevronDown,
  Download,
  FilePenLine,
  Forward,
  Inbox,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  Paperclip,
  Plus,
  Reply,
  Search,
  Send,
  Settings,
  Star,
  Trash2,
  TriangleAlert,
} from "lucide-react"

type Thread = {
  sender: string
  initials: string
  time: string
  subject: string
  count?: number
  preview: string
  unread?: boolean
  attachment?: boolean
  tone: string
}

const threads: Thread[] = [
  {
    sender: "Priya Shah",
    initials: "PS",
    time: "11:42 AM",
    subject: "Launch assets for Friday",
    count: 3,
    preview: "Final homepage copy is attached. Everything is ready for review.",
    unread: true,
    attachment: true,
    tone: "coral",
  },
  {
    sender: "Marcus Chen",
    initials: "MC",
    time: "10:18 AM",
    subject: "Re: Enterprise onboarding",
    count: 5,
    preview: "The workspace is provisioned and the team can sign in now.",
    unread: true,
    tone: "violet",
  },
  {
    sender: "Avery Williams",
    initials: "AW",
    time: "Yesterday",
    subject: "Billing address updated",
    preview: "Thanks for making that change so quickly.",
    tone: "blue",
  },
  {
    sender: "Support queue",
    initials: "SQ",
    time: "Yesterday",
    subject: "Import completed",
    count: 2,
    preview: "All conversations and attachments have been imported.",
    tone: "green",
  },
  {
    sender: "Noah Martinez",
    initials: "NM",
    time: "Jul 30",
    subject: "Domain verification",
    preview: "The DNS records are live on our side.",
    tone: "amber",
  },
  {
    sender: "Sofia Kim",
    initials: "SK",
    time: "Jul 29",
    subject: "Team access request",
    preview: "Could you add our operations lead to the shared mailbox?",
    tone: "rose",
  },
]

const folders: Array<{ label: string; icon: LucideIcon; count?: string; active?: boolean }> = [
  { label: "Inbox", icon: Inbox, count: "8", active: true },
  { label: "Sent", icon: Send },
  { label: "Drafts", icon: FilePenLine, count: "2" },
  { label: "Starred", icon: Star },
  { label: "Archived", icon: Archive },
  { label: "Trash", icon: Trash2 },
  { label: "Catch-all", icon: TriangleAlert, count: "1" },
]

function useWorkspaceScrollMotion(ref: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const element = ref.current

    if (!element) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let animationFrame = 0

    const render = () => {
      animationFrame = 0

      const viewportHeight = window.innerHeight
      const motionScale = Math.min(1, Math.max(0.62, window.innerWidth / 960))
      const rawProgress = (window.scrollY - viewportHeight * 0.05) / (viewportHeight * 0.72)
      const progress = reducedMotion.matches ? 0 : Math.min(1, Math.max(0, rawProgress))
      const easedProgress = progress * progress * (3 - 2 * progress)

      element.dataset.motion = reducedMotion.matches ? "reduced" : "scroll"
      element.style.setProperty("--desktop-y", `${(easedProgress * -24 * motionScale).toFixed(2)}px`)
      element.style.setProperty("--desktop-scale", (1 + easedProgress * 0.075).toFixed(4))
      element.style.setProperty("--dot-x", `${(easedProgress * -12 * motionScale).toFixed(2)}px`)
      element.style.setProperty("--dot-y", `${(easedProgress * 8 * motionScale).toFixed(2)}px`)
      element.style.setProperty("--dot-x-secondary", `${(easedProgress * 10 * motionScale).toFixed(2)}px`)
      element.style.setProperty("--dot-y-secondary", `${(easedProgress * -10 * motionScale).toFixed(2)}px`)
    }

    const queueRender = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(render)
    }

    render()
    window.addEventListener("scroll", queueRender, { passive: true })
    window.addEventListener("resize", queueRender)
    reducedMotion.addEventListener("change", queueRender)

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      window.removeEventListener("scroll", queueRender)
      window.removeEventListener("resize", queueRender)
      reducedMotion.removeEventListener("change", queueRender)
    }
  }, [ref])
}

function CloudField() {
  return (
    <div className="workspace-cloud-field" aria-hidden="true">
      <span className="workspace-cloud-dots" />
    </div>
  )
}

function Avatar({ thread }: { thread: Thread }) {
  return <span className={`workspace-avatar workspace-avatar-${thread.tone}`}>{thread.initials}</span>
}

function ThreadRows({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={mobile ? "workspace-thread-rows workspace-mobile-rows" : "workspace-thread-rows"}>
      {threads.map((thread, index) => (
        <div
          className={`workspace-thread-row${index === 0 ? " is-selected" : ""}${thread.unread ? " is-unread" : ""}`}
          key={thread.subject}
        >
          <Avatar thread={thread} />
          <span className="workspace-thread-copy">
            <span className="workspace-thread-meta">
              <strong>{thread.sender}</strong>
              <time>{thread.time}</time>
            </span>
            <span className="workspace-thread-subject">
              <b>{thread.subject}</b>
              {thread.count ? <i>{thread.count}</i> : null}
              {thread.attachment ? <Paperclip aria-hidden="true" /> : null}
            </span>
            <span className="workspace-thread-preview">{thread.preview}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function WorkspaceSidebar() {
  return (
    <aside className="workspace-sidebar">
      <div className="workspace-brand-row">
        <img src="/logo.svg" alt="" />
        <strong>HQBase</strong>
      </div>
      <div className="workspace-mailbox-picker">
        <span>HQBase workspace</span>
        <small>All mailboxes</small>
        <ChevronDown aria-hidden="true" />
      </div>
      <nav className="workspace-folder-list">
        {folders.map(({ label, icon: Icon, count, active }) => (
          <span className={active ? "is-active" : undefined} key={label}>
            <Icon aria-hidden="true" />
            <b>{label}</b>
            {count ? <i>{count}</i> : null}
          </span>
        ))}
      </nav>
      <div className="workspace-sidebar-utilities">
        <span><Cable aria-hidden="true" /><b>Connect MCP</b></span>
        <span><Settings aria-hidden="true" /><b>Settings</b></span>
        <span className="workspace-account"><i>AB</i><b>Alex Brown</b></span>
      </div>
    </aside>
  )
}

function WorkspaceTopbar({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={mobile ? "workspace-topbar workspace-mobile-topbar" : "workspace-topbar"}>
      <span className="workspace-icon-button">
        {mobile ? <Menu aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
      </span>
      <span className="workspace-search">
        <Search aria-hidden="true" />
        <span>Search mail</span>
      </span>
      {!mobile ? (
        <span className="workspace-mailbox-control">
          All mailboxes <i>8</i><ChevronDown aria-hidden="true" />
        </span>
      ) : null}
      <span className="workspace-compose">
        <Plus aria-hidden="true" />
        {mobile ? null : <b>Compose</b>}
      </span>
    </div>
  )
}

function WorkspaceReader() {
  return (
    <section className="workspace-reader">
      <header className="workspace-reader-header">
        <span>
          <strong>Launch assets for Friday</strong>
          <small>support@hqbase.io</small>
        </span>
        <span className="workspace-reader-tools">
          <Archive aria-hidden="true" />
          <Trash2 aria-hidden="true" />
          <MoreHorizontal aria-hidden="true" />
        </span>
      </header>
      <div className="workspace-message-scroll">
        <article className="workspace-message">
          <span className="workspace-avatar workspace-avatar-coral">PS</span>
          <div>
            <header>
              <span><strong>Priya Shah</strong><small>to Support</small></span>
              <time>10:07 AM</time>
            </header>
            <p>Hi team,</p>
            <p>The final launch assets are ready. I've included the revised homepage copy and the press folder below.</p>
          </div>
        </article>
        <article className="workspace-message workspace-message-sent">
          <span className="workspace-avatar workspace-avatar-blue">AB</span>
          <div>
            <header>
              <span><strong>Alex Brown</strong><small>to Priya</small></span>
              <time>10:31 AM</time>
            </header>
            <p>Thanks, Priya. We reviewed the copy and everything looks good from our side.</p>
          </div>
        </article>
        <article className="workspace-message">
          <span className="workspace-avatar workspace-avatar-coral">PS</span>
          <div>
            <header>
              <span><strong>Priya Shah</strong><small>to Support</small></span>
              <time>11:42 AM</time>
            </header>
            <p>Perfect - here is the approved package for Friday.</p>
            <span className="workspace-attachment">
              <span><Download aria-hidden="true" /></span>
              <span><strong>launch-assets.zip</strong><small>8.4 MB</small></span>
            </span>
          </div>
        </article>
        <div className="workspace-reply-actions">
          <span><Reply aria-hidden="true" />Reply</span>
          <span><Forward aria-hidden="true" />Forward</span>
        </div>
      </div>
    </section>
  )
}

function DesktopWorkspace() {
  return (
    <div className="workspace-live workspace-desktop">
      <WorkspaceSidebar />
      <div className="workspace-app-main">
        <WorkspaceTopbar />
        <div className="workspace-mail-layout">
          <section className="workspace-thread-list">
            <header>
              <span><strong>Conversations</strong><small>24 conversations</small></span>
              <MoreHorizontal aria-hidden="true" />
            </header>
            <ThreadRows />
          </section>
          <WorkspaceReader />
        </div>
      </div>
    </div>
  )
}

export function WorkspaceMockup() {
  const showcaseRef = React.useRef<HTMLElement>(null)
  useWorkspaceScrollMotion(showcaseRef)

  return (
    <figure className="workspace-showcase" ref={showcaseRef}>
      <CloudField />
      <div className="browser-window" aria-hidden="true">
        <div className="browser-screen"><DesktopWorkspace /></div>
      </div>
      <figcaption className="mockup-caption">
        The HQBase interface rendered live at a desktop layout with example data.
      </figcaption>
    </figure>
  )
}
