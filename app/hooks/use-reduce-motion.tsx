import { Globals } from '@react-spring/web'
import { useEffect, useState } from 'react'

/**
 * Pulled from [react-reduce-motion](https://github.com/infiniteluke/react-reduce-motion).
 */
export function useReduceMotion() {
  const [matches, setMatch] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => {
      setMatch(mq.matches)
    }
    handleChange()
    mq.addEventListener('change', handleChange)
    return () => {
      mq.removeEventListener('change', handleChange)
    }
  }, [])
  return matches
}

export function ReduceMotion() {
  const prefersReducedMotion = useReduceMotion()
  useEffect(() => {
    Globals.assign({
      skipAnimation: prefersReducedMotion,
    })
  }, [prefersReducedMotion])

  return <></>
}
