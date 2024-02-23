/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { animated, Globals, useTransition } from '@react-spring/web'
import cn from 'classnames'

import useTimeout from './use-timeout'

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
