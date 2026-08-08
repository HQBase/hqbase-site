import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Theme = "light" | "dark"

// Starlight uses this key too, so landing and documentation share one preference.
const storageKey = "starlight-theme"
const themeEvent = "hqbase-theme-change"

function readTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

function applyTheme(theme: Theme, persist: boolean) {
  const root = document.documentElement

  root.classList.toggle("dark", theme === "dark")
  root.dataset.theme = theme
  root.style.colorScheme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#111113" : "#fafafa")

  if (persist) {
    try {
      window.localStorage.setItem(storageKey, theme)
    } catch {
      // The selected theme still applies for this visit when storage is unavailable.
    }
  }

  window.dispatchEvent(new CustomEvent<Theme>(themeEvent, { detail: theme }))
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = React.useState<Theme>("light")

  React.useEffect(() => {
    const syncTheme = () => setTheme(readTheme())
    const syncStoredTheme = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      if (event.newValue === "light" || event.newValue === "dark") {
        applyTheme(event.newValue, false)
        return
      }

      applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light", false)
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const followSystemTheme = () => {
      let hasSavedTheme = false

      try {
        const savedTheme = window.localStorage.getItem(storageKey)
        hasSavedTheme = savedTheme === "light" || savedTheme === "dark"
      } catch {
        // Fall back to the operating-system preference when storage is unavailable.
      }

      if (!hasSavedTheme) applyTheme(media.matches ? "dark" : "light", false)
    }

    syncTheme()
    window.addEventListener(themeEvent, syncTheme)
    window.addEventListener("storage", syncStoredTheme)
    media.addEventListener("change", followSystemTheme)

    return () => {
      window.removeEventListener(themeEvent, syncTheme)
      window.removeEventListener("storage", syncStoredTheme)
      media.removeEventListener("change", followSystemTheme)
    }
  }, [])

  const nextTheme = theme === "dark" ? "light" : "dark"

  return (
    <Button
      className={cn("theme-toggle", className)}
      size="icon-xs"
      variant="ghost"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      onClick={() => applyTheme(nextTheme, true)}
    >
      {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  )
}
