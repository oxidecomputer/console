import { useEffect, useRef } from 'react'

interface UseIntervalProps {
  fn: () => void
  delay: number | null
  /** Use to force a render because changes to the callback won't */
  key?: string
  /**
   * If true, run the callback immediately while setting up the interval.
   * Otherwise it will only run after the first interval.
   */
  immediate?: boolean
}

// use null delay to prevent the interval from firing
export default function useInterval({ fn, delay, key, immediate }: UseIntervalProps) {
  const callbackRef = useRef<() => void>()

  useEffect(() => {
    callbackRef.current = fn
  }, [fn])

  useEffect(() => {
    if (delay === null) return
    if (immediate) callbackRef.current?.()
    const intervalId = setInterval(() => callbackRef.current?.(), delay)
    return () => clearInterval(intervalId)
  }, [delay, key, immediate])
}
