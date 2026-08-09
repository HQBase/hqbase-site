import {
  AtSign,
  BellRing,
  Bot,
  Cloud,
  KeyRound,
  RotateCcw,
} from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "Email via MCP",
    description: "Connect AI clients over OAuth to search, draft, reply, and send.",
  },
  {
    icon: AtSign,
    title: "Multiple domains and mailboxes",
    description: "Bring all your domains and mailboxes into one place.",
  },
  {
    icon: KeyRound,
    title: "Access by mailbox",
    description: "Give each team member access to their respective mailboxes.",
  },
  {
    icon: BellRing,
    title: "Access anywhere",
    description: "Polished desktop and mobile PWA client with self hosted push notifications.",
  },
  {
    icon: Cloud,
    title: "Your Cloudflare account",
    description: "Your Worker, D1 mail index, and R2 attachments stay yours.",
  },
  {
    icon: RotateCcw,
    title: "Updates with a way back",
    description: "Verify every release, back up first, and roll back when needed.",
  },
]

export function FeaturesBento() {
  return (
    <section className="page-section features-section" id="features" aria-labelledby="features-title">
      <div className="page-shell">
        <div className="features-heading" data-reveal="up">
          <h2 id="features-title">Email that works for the whole team</h2>
          <p>Share inboxes, manage access, and connect AI tools, while your mail stays in your Cloudflare account.</p>
        </div>

        <div className="feature-grid">
          {features.map(({ icon: Icon, title, description }) => (
            <article className="feature-item" data-reveal="up" key={title}>
              <header className="feature-item-heading">
                <Icon className="feature-icon-mark" aria-hidden="true" />
                <h3>{title}</h3>
              </header>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
