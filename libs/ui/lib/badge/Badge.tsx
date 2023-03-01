import cn from 'classnames'
import invariant from 'tiny-invariant'

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

const defaultStyles = 'ring-1 ring-inset'

export const badgeColors: Record<BadgeVariant, Partial<Record<BadgeColor, string>>> = {
  default: {
    default: `${defaultStyles} bg-accent-secondary text-accent ring-[rgba(var(--base-green-800-rgb),0.15)]`,
    destructive: `${defaultStyles} bg-destructive-secondary text-destructive ring-[rgba(var(--base-red-800-rgb),0.15)]`,
    notice: `${defaultStyles} bg-notice-secondary text-notice ring-[rgba(var(--base-yellow-800-rgb),0.15)]`,
    neutral: `${defaultStyles} bg-secondary text-secondary ring-[rgba(var(--base-neutral-700-rgb),0.15)]`,
    purple: `${defaultStyles} bg-[var(--base-purple-200)] text-[var(--base-purple-700)] ring-[rgba(var(--base-purple-700-rgb),0.15)]`,
    blue: `${defaultStyles} bg-[var(--base-blue-200)] text-[var(--base-blue-700)] ring-[rgba(var(--base-blue-700-rgb),0.15)]`,
  },
  solid: {
    default: 'bg-accent text-inverse',
    destructive: 'bg-destructive text-inverse',
    notice: 'bg-notice text-inverse',
    neutral: 'bg-inverse-tertiary text-inverse',
    purple: 'bg-[var(--base-purple-700)] text-[var(--base-purple-200)]',
    blue: 'bg-[var(--base-blue-700)] text-[var(--base-blue-200)]',
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
        'ox-badge',
        `variant-${variant}`,
        'inline-flex h-4 items-center whitespace-nowrap rounded-sm py-[1px] px-[3px] uppercase text-mono-sm',
        badgeColors[variant][color],
        className
      )}
    >
      <span>{children}</span>
    </span>
  )
}
