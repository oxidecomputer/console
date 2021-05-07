import { spacing } from '@oxide/css-helpers'
import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const TimerContainer = styled.div`
  position: relative;
  width: ${spacing(6)};
  height: ${spacing(6)};
`

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

const TimerSVG = styled.svg`
  transform: scaleX(-1);
`

const TimerCircle = styled.g`
  fill: none;
  stroke: none;
`

const TimerPathElapsed = styled.circle`
  stroke-width: 4px;
  stroke: transparent;
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

// Caculated from radius of circle: 2πr, r = 45 (see `r` on `TimerPathElapsed`)
const FULL_DASH_ARRAY = 283

const calcTimeFraction = (passed: number, total: number) => {
  const timeLeft = total - passed
  const rawTimeFraction = timeLeft / total
  return rawTimeFraction - (1 / total) * (1 - rawTimeFraction)
}
export interface TimeoutIndicatorProps {
  timeout: number
  onTimeoutEnd: () => void
}

export const TimeoutIndicator: FC<TimeoutIndicatorProps> = ({
  timeout,
  onTimeoutEnd,

  children,
}) => {
  const [strokeDasharray, setStrokeDasharray] = useState<number | null>(null)
  const [timePassed, setTimePassed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimePassed((t) => t + 1)
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    setStrokeDasharray(
      Math.max(calcTimeFraction(timePassed, timeout) * FULL_DASH_ARRAY, 0)
    )
  }, [timePassed, timeout])

  useEffect(() => {
    if (timePassed >= timeout) {
      onTimeoutEnd()
    }
  }, [onTimeoutEnd, timePassed, timeout])

  return (
    <TimerContainer>
      <TimerSVG viewBox="0 0 100 100">
        <TimerCircle>
          <TimerPathElapsed cx="50" cy="50" r="45" />
          <TimerPathRemaining
            strokeDasharray={`${
              strokeDasharray !== null ? strokeDasharray.toFixed(0) : ''
            } ${FULL_DASH_ARRAY}`}
            d="
            M 50, 50
            m -45, 0 
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
          "
          />
        </TimerCircle>
      </TimerSVG>
      <TimerContent>{children}</TimerContent>
    </TimerContainer>
  )
}
