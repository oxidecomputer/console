import React from 'react'
import cn from 'classnames'
import { invariant } from '@oxide/util'

export type BadgeColor = 'default' | 'destructive' | 'notice' | 'neutral'
export type BadgeVariant = 'default' | 'secondary' | 'ghost'

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
  default: {
    default: 'bg-accent text-inverse',
    destructive: 'bg-destructive text-inverse',
    notice: 'bg-notice text-inverse',
    neutral: 'bg-inverse-tertiary text-inverse',
  },
  secondary: {
    default: 'bg-accent-secondary text-accent selected:bg-accent-secondary',
    destructive: 'bg-destructive-secondary text-destructive',
    notice: 'bg-notice-secondary text-notice',
    neutral: 'bg-secondary text-secondary',
  },
  ghost: {
    default:
      'ring-1 ring-inset ring-accent-secondary text-accent bg-accent-secondary',
    destructive:
      'ring-1 ring-inset ring-destructive-secondary text-destructive bg-destructive-secondary',
    notice:
      'ring-1 ring-inset ring-notice-secondary text-notice bg-notice-secondary',
  },
}

export const Badge = ({
  className,
  children,
  color = 'default',
  variant = 'default',
}: BadgeProps) => {
  invariant(
    badgeColors[variant][color],
    `${variant} ${color} is not a valid variant/color combination`
  )
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
