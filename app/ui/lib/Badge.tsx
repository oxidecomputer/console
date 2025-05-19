/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'

export type BadgeColor =
  | 'default'
  | 'destructive'
  | 'notice'
  | 'neutral'
  | 'purple'
  | 'blue'
export type BadgeVariant = 'default' | 'solid'

export interface BadgeProps {
  color?: BadgeColor
  className?: string
  children: React.ReactNode
  variant?: BadgeVariant
}

export const badgeColors: Record<BadgeVariant, Record<BadgeColor, string>> = {
  default: {
    default: `ring ring-inset bg-accent-secondary text-accent ring-accent/15`,
    destructive: `ring ring-inset bg-destructive-secondary text-destructive ring-destructive/15`,
    notice: `ring ring-inset bg-notice-secondary text-notice ring-notice/15`,
    neutral: 'ring ring-inset bg-secondary text-default ring-neutral-700/15',
    purple: `ring ring-inset bg-purple-200 text-purple-800 ring-purple-800/15`,
    blue: `ring ring-inset bg-info-secondary text-info ring-blue-800/15`,
  },
  solid: {
    default: 'bg-accent text-inverse',
    destructive: 'bg-destructive text-inverse',
    notice: 'bg-notice text-inverse',
    neutral: 'bg-neutral-700 text-inverse',
    purple: 'bg-purple-700 text-inverse',
    blue: 'bg-info text-inverse',
  },
}

export const Badge = ({
  className,
  children,
  color = 'default',
  variant = 'default',
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'ox-badge',
        `variant-${variant}`,
        'text-mono-sm inline-flex h-4 items-center rounded-sm px-[3px] py-px whitespace-nowrap uppercase',
        badgeColors[variant][color],
        className
      )}
    >
      <span>{children}</span>
    </span>
  )
}
