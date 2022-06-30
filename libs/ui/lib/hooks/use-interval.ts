import { useEffect, useRef } from 'react'

// use null delay to prevent the interval from firing
export default function useInterval(callback: () => void, delay: number | null) {
  const callbackRef = useRef<() => void>()

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const intervalId = setInterval(() => callbackRef.current?.(), delay)
    return () => clearInterval(intervalId)
  }, [delay])
}
