import { useRef } from 'react'
import React, { useEffect, useState } from 'react'
import { styled } from 'twin.macro'

const TimerContent = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: center;
`

const TimerPathRemaining = styled.path`
  stroke-width: 4px;
  stroke-linecap: round;
  transform: rotate(90deg);
  transform-origin: center;
  transition: 1s linear all;
  fill-rule: nonzero;
  stroke: white;
`

// use null delay to prevent the interval from firing
const useInterval = (callback: () => void, delay: number | null) => {
  const callbackRef = useRef<() => void>()

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (delay !== null) {
      const intervalId = setInterval(() => callbackRef.current?.(), delay)
      return () => clearInterval(intervalId)
    }
  }, [delay])
}

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
    <div tw="relative w-6 h-6">
      <svg fill="none" viewBox="0 0 100 100">
        <g>
          <TimerPathRemaining
            strokeDasharray={`${strokeDash} ${FULL_DASH}`}
            d="
              M 5, 50
              a 45,45 0 1,1 90,0
              a 45,45 0 1,1 -90,0
            "
          />
        </g>
      </svg>
      <TimerContent>{children}</TimerContent>
    </div>
  )
}
