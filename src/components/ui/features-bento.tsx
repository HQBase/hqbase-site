import {
  AtSign,
  BellRing,
  Bot,
  Cloud,
  KeyRound,
  RotateCcw,
} from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const features = [
  {
    icon: Bot,
    title: "Email via MCP",
    description: "Connect AI clients over OAuth to search, draft, reply, and send.",
  },
  {
    icon: AtSign,
    title: "Multiple domains and mailboxes",
    description: "One workspace for all your domains and mailboxes.",
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
        <div className="features-heading">
          <h2 id="features-title">One home for all your team's email</h2>
          <p>Manage every inbox, connect AI tools, and keep your mail and data in your own Cloudflare account.</p>
        </div>

        <div className="feature-grid">
          {features.map(({ icon: Icon, title, description }) => (
            <Card className="feature-item" key={title} role="article">
              <CardHeader className="feature-card-header">
                <div className="feature-icon-field" aria-hidden="true">
                  <span className="feature-icon-grid" />
                  <Icon className="feature-icon-mark" />
                </div>
                <div className="feature-card-copy">
                  <CardTitle className="feature-card-title">
                    <h3>{title}</h3>
                  </CardTitle>
                  <CardDescription className="feature-card-description">
                    <p>{description}</p>
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
