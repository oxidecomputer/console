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
    default: `ring-1 ring-inset bg-accent-secondary text-accent ring-[rgba(var(--base-green-800-rgb),0.15)]`,
    destructive: `ring-1 ring-inset bg-destructive-secondary text-destructive ring-[rgba(var(--base-red-800-rgb),0.15)]`,
    notice: `ring-1 ring-inset bg-notice-secondary text-notice ring-[rgba(var(--base-yellow-800-rgb),0.15)]`,
    neutral: `ring-1 ring-inset bg-secondary text-secondary ring-[rgba(var(--base-neutral-700-rgb),0.15)]`,
    purple: `ring-1 ring-inset bg-[var(--base-purple-200)] text-[var(--base-purple-700)] ring-[rgba(var(--base-purple-700-rgb),0.15)]`,
    blue: `ring-1 ring-inset bg-[var(--base-blue-200)] text-[var(--base-blue-700)] ring-[rgba(var(--base-blue-700-rgb),0.15)]`,
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
  return (
    <span
      className={cn(
        'ox-badge',
        `variant-${variant}`,
        'inline-flex h-5 items-center whitespace-nowrap rounded-sm py-[1px] px-[3px] uppercase text-mono-sm',
        badgeColors[variant][color],
        className
      )}
    >
      <span>{children}</span>
    </span>
  )
}
