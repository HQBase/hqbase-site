import { ArrowRight, CodeXml } from "lucide-react"

import { Button } from "@/components/ui/button"

const deployUrl =
  "https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2FHQBase%2Fhqbase"
const sourceUrl = "https://github.com/HQBase/hqbase"

export function HeroActions() {
  return (
    <div className="hero-actions">
      <Button asChild className="hero-button" size="lg">
        <a href={deployUrl}>
          Deploy HQBase
          <ArrowRight data-icon="inline-end" />
        </a>
      </Button>
      <Button asChild className="hero-button" size="lg" variant="outline">
        <a href={sourceUrl}>
          <CodeXml data-icon="inline-start" />
          View source
        </a>
      </Button>
    </div>
  )
}
