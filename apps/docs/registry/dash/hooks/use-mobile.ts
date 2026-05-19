"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * useMobile — returns true when viewport is below 768px (md breakpoint).
 * Mirrors Tailwind's md: media query so component-level layout decisions
 * stay in sync with class-based responsive styles.
 */
export function useMobile(breakpoint = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = () => setIsMobile(mql.matches)
    handler()
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [breakpoint])

  return isMobile
}
