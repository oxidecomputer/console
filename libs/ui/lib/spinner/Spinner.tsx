import cn from 'classnames'

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
