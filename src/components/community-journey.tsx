import { Check, MessagesSquare, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CommunityMap } from "@/components/community-map"

const sourceUrl = "https://github.com/HQBase/hqbase"
const discussionsUrl = "https://github.com/orgs/HQBase/discussions"

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
    detail: "Share ideas, questions, and what you need",
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
          <div className="journey-copy">
            <h2 id="journey-title">We're building team email on Cloudflare.</h2>
            <p className="journey-description">
              Own the software, the data, and the way your team works.
            </p>
            <div className="journey-actions">
              <Button asChild className="journey-community-button" size="lg">
                <a href={sourceUrl}>
                  <Star data-icon="inline-start" />
                  Star the repo
                </a>
              </Button>
              <Button
                asChild
                className="journey-community-button"
                size="lg"
                variant="outline"
              >
                <a href={discussionsUrl}>
                  <MessagesSquare data-icon="inline-start" />
                  Join the discussion
                </a>
              </Button>
            </div>
          </div>

          <div className="journey-timeline-panel">
            <div className="journey-timeline-header">
              <h3>Follow the journey</h3>
            </div>
            <ol className="journey-timeline" aria-label="HQBase journey">
              {milestones.map(({ dateTime, detail, label, state, title }) => (
                <li
                  className="journey-step"
                  data-state={state}
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
