/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { m, useReducedMotion } from 'framer-motion'

import { useTimeout } from './use-timeout'

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
  const shouldReduceMotion = useReducedMotion()

  useTimeout(onTimeoutEnd, timeout)

  return null

  if (shouldReduceMotion) {
    return null
  }

  return (
    <m.div
      className={cn('absolute bottom-0 left-0 h-0.5 w-0', className)}
      initial={{ width: '0%' }}
      animate={{
        width: '100%',
        transition: { duration: timeout / 1000, ease: 'linear' },
      }}
    />
  )
}
