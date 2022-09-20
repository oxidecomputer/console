import { animated, useTransition } from '@react-spring/web'
import { Globals } from '@react-spring/web'
import cn from 'classnames'

import useTimeout from '../hooks/use-timeout'

export interface TimeoutIndicatorProps {
  timeout: number
  onTimeoutEnd: () => void
  className: string
}

export const TimeoutIndicator = ({
  timeout,
  onTimeoutEnd,
  className,
}: TimeoutIndicatorProps) => {
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
      className={cn('absolute bottom-0 left-0 h-0.5 w-0', className)}
      style={styles}
    />
  ))
}
