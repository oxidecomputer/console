import { animated, useTransition } from '@react-spring/web'
import { Globals } from '@react-spring/web'

import useTimeout from '../hooks/use-timeout'

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

  useTimeout(onTimeoutEnd, timeout)

  // Don't show progress bar if reduce motion is turned on
  if (Globals.skipAnimation) return null

  return transitions((styles) => (
    <animated.div
      className="w-0 h-0.5 bg-green-700 absolute bottom-0 left-0"
      style={styles}
    />
  ))
}
