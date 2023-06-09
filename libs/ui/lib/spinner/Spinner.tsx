import cn from 'classnames'
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

export const SpinnerLoader = ({
  isLoading,
  children = null,
  loadTime = 750,
}: {
  isLoading: boolean
  children?: JSX.Element | null
  loadTime?: number
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)

  // startLoadTimeRef stores the timestamp when the loading started
  const startLoadTimeRef = useRef<number>(0)

  useEffect(() => {
    // shouldSpinTimer is the timer that will make the Spinner visible if
    // isLoading lasts more than 25ms.
    let shouldSpinTimer: NodeJS.Timeout

    if (isLoading) {
      setIsVisible(false)
      startLoadTimeRef.current = Date.now()

      // We don't show the spinner if the load time is less than 25ms
      shouldSpinTimer = setTimeout(() => {
        setIsVisible(true)
      }, 25)
    } else {
      // Clear the hide timer if it's still running.
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }

      // Calculate how long the loading took.
      const elapsedLoadTime = Date.now() - startLoadTimeRef.current

      // Set a timer to hide the Spinner and show the children. The duration of
      // the timer is the load time minus the elapsed load time, or 0 if loading
      // took longer than the load time.
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false)
      }, Math.max(0, loadTime - elapsedLoadTime))
    }

    return () => {
      shouldSpinTimer && clearTimeout(shouldSpinTimer)
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [isLoading, loadTime])

  return isVisible ? <Spinner /> : children
}
