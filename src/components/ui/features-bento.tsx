import {
  AtSign,
  BellRing,
  Cloud,
  KeyRound,
  RotateCcw,
  SquareTerminal,
} from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const features = [
  {
    icon: SquareTerminal,
    title: "AI-ready mail",
    description: "Connect trusted AI clients over OAuth to search, draft, reply, and send.",
  },
  {
    icon: AtSign,
    title: "Every inbox, together",
    description: "Run every domain and mailbox from one workspace.",
  },
  {
    icon: KeyRound,
    title: "Access by mailbox",
    description: "Give each person Read, Agent, or Manager access—nothing broader.",
  },
  {
    icon: BellRing,
    title: "Install anywhere",
    description: "Use HQBase as a PWA with optional, privacy-conscious Web Push.",
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
          <h2 id="features-title">One place for people, agents, and every inbox.</h2>
          <p>Email, permissions, automation, and updates—running in your Cloudflare account.</p>
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
