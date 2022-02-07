import React, { useEffect, useState } from 'react'

import useInterval from '../hooks/use-interval'
import './TimeoutIndicator.css'

// r = 45 (see `r` on TimerPathRemaining)
const FULL_DASH = 2 * Math.PI * 45

export interface TimeoutIndicatorProps {
  timeout: number
  onTimeoutEnd: () => void
  children: React.ReactNode
}

export const TimeoutIndicator = ({
  timeout,
  onTimeoutEnd,
  children,
}: TimeoutIndicatorProps) => {
  const [timeElapsed, setTimeElapsed] = useState(0)
  const timedOut = timeElapsed >= timeout
  useInterval(() => setTimeElapsed((t) => t + 1000), timedOut ? null : 1000)

  const timeLeftFraction = (timeout - timeElapsed) / timeout
  const strokeDash = Math.max(Math.round(timeLeftFraction * FULL_DASH), 0)

  useEffect(() => {
    timedOut && onTimeoutEnd()
  }, [timedOut, onTimeoutEnd])

  return (
    <div className="TimeoutIndicator relative h-6 w-6">
      <svg fill="none" viewBox="-2 -2 100 100">
        <g>
          <path
            className="remaining"
            strokeDasharray={`${strokeDash} ${FULL_DASH}`}
            d="
              M 5, 50
              a 45,45 0 1,1 90,0
              a 45,45 0 1,1 -90,0
            "
          />
        </g>
      </svg>
      <span className="content">{children}</span>
    </div>
  )
}
