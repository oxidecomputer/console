import React from 'react'
import cn from 'classnames'

export type BadgeColor =
  | 'green'
  | 'red'
  | 'yellow'
  | 'blue'
  | 'darkGray'
  | 'lightGray'
export type BadgeVariant = 'solid' | 'dim' | 'ghost'

export interface BadgeProps {
  color?: BadgeColor
  className?: string
  children: React.ReactNode
  variant?: BadgeVariant
}

export const badgeColors: Record<
  BadgeVariant,
  Partial<Record<BadgeColor, string>>
> = {
  solid: {
    green: 'bg-green-500 text-black',
    red: 'bg-red-500 text-black',
    yellow: 'bg-yellow-500 text-black',
    blue: 'bg-blue-500 text-black',
  },
  dim: {
    green: 'bg-green-950 text-green-500',
    red: 'bg-red-900 text-red-500',
    yellow: 'bg-yellow-900 text-yellow-500',
    blue: 'bg-blue-900 text-blue-500',
    darkGray: 'bg-gray-500 text-gray-100',
    lightGray: 'bg-gray-300 text-black',
  },
  ghost: {
    green: 'border border-green-800 text-green-500 bg-green-950',
    red: 'border border-red-800 text-red-500 bg-red-950',
    yellow: 'border border-yellow-800 text-yellow-500 bg-yellow-950',
    blue: 'border border-blue-800 text-blue-500 bg-blue-950',
  },
}

export const Badge = ({
  className,
  children,
  color = 'green',
  variant = 'solid',
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center uppercase font-mono text-sm font-thin rounded-sm px-1 whitespace-nowrap',
        badgeColors[variant][color],
        className
      )}
    >
      <span>{children}</span>
    </span>
  )
}
