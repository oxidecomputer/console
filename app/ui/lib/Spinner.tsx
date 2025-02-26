/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export const spinnerSizes = ['base', 'md', 'lg'] as const
export const spinnerVariants = ['primary', 'secondary', 'ghost', 'danger'] as const
export type SpinnerSize = (typeof spinnerSizes)[number]
export type SpinnerVariant = (typeof spinnerVariants)[number]

interface SpinnerProps {
  className?: string
  size?: SpinnerSize
  variant?: SpinnerVariant
}

const SPINNER_DIMENSIONS = {
  base: {
    frameSize: 12,
    center: 6,
    radius: 5,
    strokeWidth: 2,
  },
  md: {
    frameSize: 24,
    center: 12,
    radius: 10,
    strokeWidth: 2,
  },
  lg: {
    frameSize: 36,
    center: 18,
    radius: 16,
    strokeWidth: 3,
  },
} as const

export const Spinner = ({
  className,
  size = 'base',
  variant = 'primary',
}: SpinnerProps) => {
  const dimensions = SPINNER_DIMENSIONS[size]
  const { frameSize, center, radius, strokeWidth } = dimensions

  return (
    <svg
      width={frameSize}
      height={frameSize}
      viewBox={`0 0 ${frameSize + ' ' + frameSize}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Spinner"
      className={cn('spinner', `spinner-${variant}`, `spinner-${size}`, className)}
    >
      <circle
        fill="none"
        className="bg"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        cx={center}
        cy={center}
        r={radius}
        strokeOpacity={0.2}
      />
      <circle
        className="path"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        cx={center}
        cy={center}
        r={radius}
      />
    </svg>
  )
}

type Props = {
  isLoading: boolean
  children?: ReactNode
  minTime?: number
}

/** Loading spinner that shows for a minimum of `minTime` */
export const SpinnerLoader = ({ isLoading, children = null, minTime = 500 }: Props) => {
  const [isVisible, setIsVisible] = useState(isLoading)
  const hideTimeout = useRef<NodeJS.Timeout | null>(null)
  const loadingStartTime = useRef<number>(0)

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true)
      loadingStartTime.current = Date.now()
    } else {
      // Clear the hide timer if it's still running.
      if (hideTimeout.current) clearTimeout(hideTimeout.current)

      // turn the spinner off, making sure it showed for at least `minTime`
      const elapsedTime = Date.now() - loadingStartTime.current
      const remainingTime = Math.max(0, minTime - elapsedTime)
      if (remainingTime === 0) {
        setIsVisible(false) // might as well not use a timeout
      } else {
        hideTimeout.current = setTimeout(() => setIsVisible(false), remainingTime)
      }
    }

    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current)
    }
  }, [isLoading, minTime])

  return isVisible ? <Spinner /> : <>{children}</>
}
