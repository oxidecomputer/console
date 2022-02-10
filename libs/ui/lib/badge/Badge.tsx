import React from 'react'
import cn from 'classnames'

export type BadgeColor =
  | 'default'
  | 'destructive'
  | 'notice'
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
    default: 'bg-accent-solid text-black',
    destructive: 'bg-destructive-solid text-black',
    notice: 'bg-notice-solid text-black',
  },
  dim: {
    default: 'bg-accent-dim text-accent selected:bg-accent-secondary',
    destructive: 'bg-destructive-dim text-destructive',
    notice: 'bg-notice-dim text-notice',
    darkGray: 'bg-disabled text-secondary',
    lightGray: 'bg-gray-300 text-black',
  },
  ghost: {
    default:
      'ring-1 ring-inset ring-accent-secondary text-accent bg-accent-dim',
    destructive:
      'ring-1 ring-inset ring-destructive-secondary text-destructive bg-destructive-dim',
    notice: 'ring-1 ring-inset ring-notice-secondary text-notice bg-notice-dim',
  },
}

export const Badge = ({
  className,
  children,
  color = 'default',
  variant = 'solid',
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'ox-badge inline-flex h-4 items-center whitespace-nowrap rounded-sm py-[1px] px-[3px] uppercase text-mono-sm',
        badgeColors[variant][color],
        className
      )}
    >
      <span>{children}</span>
    </span>
  )
}
