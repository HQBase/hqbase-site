(() => {
  const elements = Array.from(document.querySelectorAll("[data-reveal]"))
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

  if (!elements.length || reducedMotion.matches || !("IntersectionObserver" in window)) return

  const root = document.documentElement
  const reveal = (element) => {
    element.classList.add("is-revealed")
    observer.unobserve(element)
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) reveal(entry.target)
      })
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    },
  )

  const showEverything = () => {
    observer.disconnect()
    elements.forEach((element) => element.classList.add("is-revealed"))
    root.classList.remove("reveal-motion")
  }

  root.classList.add("reveal-motion")
  elements.forEach((element) => observer.observe(element))
  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) showEverything()
  })
})()
