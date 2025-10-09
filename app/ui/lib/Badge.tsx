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
    default: `ring ring-inset bg-accent-secondary text-accent ring-[rgba(var(--base-green-800-rgb),0.15)]`,
    destructive: `ring ring-inset bg-destructive-secondary text-destructive ring-[rgba(var(--base-red-800-rgb),0.15)]`,
    notice: `ring ring-inset bg-notice-secondary text-notice ring-[rgba(var(--base-yellow-800-rgb),0.15)]`,
    neutral: `ring ring-inset bg-secondary text-default ring-[rgba(var(--base-neutral-700-rgb),0.15)]`,
    purple: `ring ring-inset bg-(--base-purple-200) text-(--base-purple-700) ring-[rgba(var(--base-purple-800-rgb),0.15)]`,
    blue: `ring ring-inset bg-info-secondary text-info ring-[rgba(var(--base-blue-800-rgb),0.15)]`,
  },
  solid: {
    default: 'bg-accent text-inverse',
    destructive: 'bg-destructive text-inverse',
    notice: 'bg-notice text-inverse',
    neutral: 'bg-(--base-neutral-700) text-inverse',
    purple: 'bg-(--base-purple-700) text-inverse',
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
        'text-mono-sm inline-flex h-[18px] items-center rounded px-1 whitespace-nowrap uppercase',
        badgeColors[variant][color],
        className
      )}
    >
      <span>{children}</span>
    </span>
  )
}
