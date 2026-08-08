import * as React from "react"

import { Button } from "@/components/ui/button"
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon"
import { useScroll } from "@/components/ui/use-scroll"
import { cn } from "@/lib/utils"

const deployUrl =
  "https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2FHQBase%2Fhqbase"
const sourceUrl = "https://github.com/HQBase/hqbase"

const links = [
  { label: "Features", href: "#features" },
  { label: "Docs", href: "/docs/" },
]

function Brand() {
  return (
    <a className="brand" href="/" aria-label="HQBase home">
      <img className="brand-logo" src="/logo.svg" alt="" width="168" height="132" />
    </a>
  )
}

export function Header() {
  const [open, setOpen] = React.useState(false)
  const scrolled = useScroll(10)

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    if (open) window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [open])

  const closeMenu = () => setOpen(false)

  return (
    <header
      className={cn(
        "site-header",
        scrolled && !open && "site-header-scrolled",
        open && "site-header-open"
      )}
    >
      <nav className="site-header-nav" aria-label="Primary">
        <Brand />

        <div className="desktop-navigation">
          {links.map((link) => (
            <a className="header-link" href={link.href} key={link.href}>{link.label}</a>
          ))}
          <a className="header-link" href={sourceUrl}>GitHub</a>
          <Button asChild className="header-button" size="xs">
            <a href={deployUrl}>Get started</a>
          </Button>
        </div>

        <Button
          className="header-menu-button"
          size="icon-sm"
          variant="outline"
          aria-controls="mobile-navigation"
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((current) => !current)}
        >
          <MenuToggleIcon open={open} />
        </Button>
      </nav>

      {open ? (
        <div className="mobile-navigation" id="mobile-navigation">
          <div className="mobile-navigation-links">
            {links.map((link) => (
              <a
                className="mobile-navigation-link"
                href={link.href}
                key={link.href}
                onClick={closeMenu}
              >
                {link.label}
              </a>
            ))}
            <a className="mobile-navigation-link" href={sourceUrl} onClick={closeMenu}>
              GitHub
            </a>
          </div>
          <div className="mobile-navigation-actions">
            <Button asChild className="mobile-navigation-action">
              <a href={deployUrl} onClick={closeMenu}>Get started</a>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
