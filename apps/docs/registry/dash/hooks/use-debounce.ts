"use client"

import * as React from "react"

/**
 * useDebounce — returns a debounced copy of `value` that only updates after
 * `delay` ms of inactivity. Use for search inputs, filter changes,
 * auto-save triggers.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/**
 * useDebouncedCallback — returns a stable callback that schedules the wrapped
 * fn to run after `delay` ms of inactivity. Useful for onChange handlers
 * that should fire to backend but not on every keystroke.
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay = 300,
) {
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const cb = React.useRef(callback)

  React.useEffect(() => {
    cb.current = callback
  }, [callback])

  return React.useCallback(
    (...args: TArgs) => {
      if (timeout.current) clearTimeout(timeout.current)
      timeout.current = setTimeout(() => cb.current(...args), delay)
    },
    [delay],
  )
}
