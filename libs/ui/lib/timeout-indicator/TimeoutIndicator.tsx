import { animated, useTransition } from '@react-spring/web'
import { useEffect } from 'react'
import { Globals } from 'react-spring'

export interface TimeoutIndicatorProps {
  timeout: number
  onTimeoutEnd: () => void
}

export const TimeoutIndicator = ({ timeout, onTimeoutEnd }: TimeoutIndicatorProps) => {
  const transitions = useTransition(true, {
    from: { width: '0%' },
    enter: { width: '100%' },
    leave: { width: '100%' },
    config: { duration: timeout },
  })

  useEffect(() => {
    if (timeout) {
      const t = setTimeout(onTimeoutEnd, timeout)
      return () => clearTimeout(t)
    }
  }, [timeout, onTimeoutEnd])

  // Don't show progress bar if reduce motion is turned on
  if (Globals.skipAnimation !== true) {
    return transitions((styles) => (
      <animated.div
        className="w-0 h-0.5 bg-green-700 absolute bottom-0 left-0"
        style={styles}
      />
    ))
  } else {
    return null
  }
}
