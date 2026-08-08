(() => {
  // Starlight uses this key too, so landing and documentation share one preference.
  const storageKey = "starlight-theme"
  const legacyStorageKey = "hqbase-site-theme"
  const root = document.documentElement
  let storedTheme = null

  try {
    storedTheme = window.localStorage.getItem(storageKey)
    if (storedTheme !== "light" && storedTheme !== "dark") {
      const legacyTheme = window.localStorage.getItem(legacyStorageKey)

      if (legacyTheme === "light" || legacyTheme === "dark") {
        storedTheme = legacyTheme
        window.localStorage.setItem(storageKey, legacyTheme)
        window.localStorage.removeItem(legacyStorageKey)
      }
    }
  } catch {
    // Storage can be unavailable in privacy-restricted contexts.
  }

  const theme =
    storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"

  root.classList.toggle("dark", theme === "dark")
  root.dataset.theme = theme
  root.style.colorScheme = theme

  const themeColor = document.querySelector('meta[name="theme-color"]')
  themeColor?.setAttribute("content", theme === "dark" ? "#111113" : "#fafafa")
})()
