import * as React from "react"

export function useScroll(threshold = 0) {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold)

    update()
    window.addEventListener("scroll", update, { passive: true })

    return () => window.removeEventListener("scroll", update)
  }, [threshold])

  return scrolled
}
