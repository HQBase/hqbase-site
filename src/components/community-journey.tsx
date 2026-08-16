import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CommunityMap } from "@/components/community-map"
import { DiscordIcon } from "@/components/discord-icon"

const discordUrl = "https://discord.gg/U67PB663nf"

const milestones = [
  {
    title: "Project started",
    detail: "Built in public from the beginning",
    label: "Done",
    state: "complete",
    dateTime: undefined,
  },
  {
    title: "HQBase v1 release",
    detail: "August 8, 2026",
    label: "Done",
    state: "complete",
    dateTime: "2026-08-09",
  },
  {
    title: "Community feedback",
    detail: "Share ideas, ask questions, and request features",
    label: "In progress",
    state: "current",
    dateTime: undefined,
  },
  {
    title: "Next release",
    detail: "Shaped in public with the community",
    label: "Planned",
    state: "upcoming",
    dateTime: undefined,
  },
] as const

export function CommunityJourney() {
  return (
    <section className="page-section journey-section" id="community" aria-labelledby="journey-title">
      <div className="page-shell">
        <div className="journey-layout">
          <div className="journey-copy" data-reveal="left">
            <h2 id="journey-title">Let's build Cloudflare Workspace together.</h2>
            <p className="journey-description">
              Team email today, with more of your team's work coming together.
            </p>
            <div className="journey-actions">
              <Button
                asChild
                className="journey-community-button"
                size="lg"
                variant="outline"
              >
                <a href={discordUrl}>
                  <DiscordIcon data-icon="inline-start" />
                  Join our Discord
                </a>
              </Button>
            </div>
          </div>

          <div className="journey-timeline-panel">
            <div className="journey-timeline-header" data-reveal="up">
              <h3>Follow the journey</h3>
            </div>
            <ol className="journey-timeline" aria-label="HQBase journey">
              {milestones.map(({ dateTime, detail, label, state, title }) => (
                <li
                  className="journey-step"
                  data-state={state}
                  data-reveal="right"
                  aria-current={state === "current" ? "step" : undefined}
                  key={title}
                >
                  <span className="journey-marker" aria-hidden="true">
                    {state === "complete" ? <Check /> : <span />}
                  </span>
                  <div className="journey-step-copy">
                    <div className="journey-step-heading">
                      <h4>{title}</h4>
                      <Badge variant="secondary">{label}</Badge>
                    </div>
                    {dateTime ? <time dateTime={dateTime}>{detail}</time> : <p>{detail}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <CommunityMap />
    </section>
  )
}
