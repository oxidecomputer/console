import { useEffect, useRef } from 'react'

// use null delay to prevent the timeout from firing
export default function useTimeout(callback: () => void, delay: number | null) {
  const callbackRef = useRef<() => void>()

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const intervalId = setTimeout(() => callbackRef.current?.(), delay)
    return () => clearTimeout(intervalId)
  }, [delay])
}
