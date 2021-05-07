import { spacing } from '@oxide/css-helpers'
import type { FC } from 'react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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

  const timerRef = useRef<NodeJS.Timeout>()

  const calcTimeFraction = useCallback(
    (passed: number) => {
      const timeLeft = timeout - passed
      const rawTimeFraction = timeLeft / timeout
      return rawTimeFraction - (1 / timeout) * (1 - rawTimeFraction)
    },
    [timeout]
  )

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimePassed((t) => {
        const t_ = t + 1

        setStrokeDasharray(Math.max(calcTimeFraction(t_) * 283, 0))

        return t_
      })
    }, 1000)

    return () => {
      timerRef.current && clearInterval(timerRef.current)
    }
  }, [calcTimeFraction, onTimeoutEnd, timeout])

  useEffect(() => {
    if (timePassed >= timeout) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
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
            } 283`}
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
