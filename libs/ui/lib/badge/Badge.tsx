import React from 'react'
import cn from 'classnames'

import { CloseSmallIcon } from '../icons'

export const badgeColors = ['gray', 'red', 'yellow', 'green', 'blue'] as const
export type BadgeColor = typeof badgeColors[number]

export const badgeSizes = ['sm', 'base'] as const
type Size = typeof badgeSizes[number]

export const badgeVariants = ['base', 'dim', 'ghost'] as const
type Variant = typeof badgeVariants[number]

export interface BadgeProps {
  color?: BadgeColor
  size?: Size
  className?: string
  // close X is shown if onClose is present
  onClose?: () => void
  children: React.ReactNode
  variant?: Variant
}

const textBase: Record<Size, string> = {
  sm: 'mx-[3px] mb-px',
  base: 'mx-2.5',
}

const textClosable: Record<Size, string> = {
  sm: 'ml-1.5 mr-1 mb-px',
  base: 'ml-2.5 mr-1.5',
}

const closeIcon: Record<Size, string> = {
  sm: '!w-[9px] mr-1.5',
  base: '!w-3 mr-2',
}

const colors: Record<Variant, Record<BadgeColor, string>> = {
  base: {
    blue: 'bg-blue-500 text-gray-50',
    gray: 'bg-gray-400 text-gray-50',
    green: 'bg-green-500 text-black',
    red: 'bg-red-500 text-black',
    yellow: 'bg-yellow-500 text-black',
  },
  dim: {
    // blue and gray have no dim versions, use base colors
    blue: 'bg-blue-500 text-gray-50',
    gray: 'bg-gray-400 text-gray-50',
    green: 'bg-green-900 text-green-500',
    red: 'bg-red-900 text-red-500',
    yellow: 'bg-yellow-900 text-yellow-500',
  },
  ghost: {
    blue: 'border border-blue-500 text-blue-500 bg-transparent',
    gray: 'border border-gray-400 text-white bg-transparent',
    green: 'border border-green-500 text-green-500 bg-transparent',
    red: 'border border-red-500 text-red-500 bg-transparent',
    yellow: 'border border-yellow-500 text-yellow-500 bg-transparent',
  },
}

export const Badge = ({
  className,
  children,
  color = 'gray',
  size = 'base',
  onClose,
  variant = 'base',
}: BadgeProps) => {
  const textStyle = onClose ? textClosable : textBase
  return (
    <span
      className={cn(
        'inline-flex items-center rounded uppercase font-mono text-xs',
        size === 'sm' ? 'h-4' : 'h-6',
        colors[variant][color],
        className
      )}
    >
      <span className={textStyle[size]}>{children}</span>
      {onClose && (
        <button type="button" className="flex cursor-pointer" onClick={onClose}>
          <CloseSmallIcon className={closeIcon[size]} />
        </button>
      )}
    </span>
  )
}
