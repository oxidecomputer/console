import cn from 'classnames'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

import './spinner.css'

export const spinnerSizes = ['base', 'lg'] as const
export const spinnerVariants = ['primary', 'secondary', 'ghost', 'danger'] as const
export type SpinnerSize = (typeof spinnerSizes)[number]
export type SpinnerVariant = (typeof spinnerVariants)[number]

interface SpinnerProps {
  className?: string
  size?: SpinnerSize
  variant?: SpinnerVariant
}

export const Spinner = ({
  className,
  size = 'base',
  variant = 'primary',
}: SpinnerProps) => {
  const frameSize = size === 'lg' ? 36 : 12
  const center = size === 'lg' ? 18 : 6
  const radius = size === 'lg' ? 16 : 5
  const strokeWidth = size === 'lg' ? 3 : 2
  return (
    <svg
      width={frameSize}
      height={frameSize}
      viewBox={`0 0 ${frameSize + ' ' + frameSize}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="Spinner"
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
