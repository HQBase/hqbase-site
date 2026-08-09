import { ArrowRight, BookOpen, Check, Cloud } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const deployUrl =
  "https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2FHQBase%2Fhqbase"
const workersPlansUrl = "https://developers.cloudflare.com/workers/platform/pricing/"
const addSiteUrl = "https://developers.cloudflare.com/fundamentals/manage-domains/add-site/"

const requirements = [
  {
    title: "Workers Paid enabled",
    detail: "Account-level, separate from your domain plan.",
    href: workersPlansUrl,
    linkLabel: "Review Workers plans",
  },
  {
    title: "R2 subscription active",
    detail: "Enable in Storage & databases / R2 / Overview.",
    href: undefined,
    linkLabel: undefined,
  },
  {
    title: "Active Cloudflare DNS domain",
    detail: "Add the domain and wait for Active.",
    href: addSiteUrl,
    linkLabel: "Add a domain",
  },
] as const

export function HeroActions() {
  return (
    <div className="hero-actions">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="hero-button hero-deploy-trigger" size="lg">
            <span className="hero-deploy-label">Deploy to Cloudflare</span>
            <ArrowRight data-icon="inline-end" />
          </Button>
        </DialogTrigger>
        <DialogContent className="deployment-dialog" showCloseButton={false}>
          <span className="deployment-dialog-glow" aria-hidden="true" />
          <div className="deployment-dialog-heading">
            <span className="deployment-dialog-mark" aria-hidden="true">
              <Cloud />
            </span>
            <DialogHeader className="deployment-dialog-header">
              <DialogTitle>Ready for Cloudflare?</DialogTitle>
              <DialogDescription>
                Confirm these three account requirements before deployment.
              </DialogDescription>
            </DialogHeader>
          </div>

          <ol className="deployment-requirements">
            {requirements.map(({ detail, href, linkLabel, title }) => (
              <li className="deployment-requirement" key={title}>
                <span className="deployment-requirement-check" aria-hidden="true">
                  <Check />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>
                    {detail}{" "}
                    {href && linkLabel ? (
                      <a href={href} rel="noreferrer" target="_blank">{linkLabel}</a>
                    ) : null}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <DialogFooter className="deployment-dialog-actions">
            <DialogClose asChild>
              <Button className="deployment-dialog-button" size="lg" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button asChild className="deployment-dialog-button deployment-confirm-button" size="lg">
              <a href={deployUrl}>
                Confirm
                <ArrowRight data-icon="inline-end" />
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button asChild className="hero-button hero-docs-button" size="lg" variant="outline">
        <a href="/docs/">
          <BookOpen data-icon="inline-start" />
          Read docs
        </a>
      </Button>
    </div>
  )
}
