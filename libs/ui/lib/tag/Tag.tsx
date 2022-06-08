import cn from 'classnames'

import { Close8Icon } from '../icons'

export type TagColor = 'default' | 'destructive' | 'notice' | 'neutral'
export type TagVariant = 'default' | 'secondary'

export interface TagProps {
  color?: TagColor
  className?: string
  children: React.ReactNode
  variant?: TagVariant
  narrow?: boolean
  onClose?: () => void
}

export const tagColors: Record<TagVariant, Partial<Record<TagColor, string>>> = {
  default: {
    default: 'bg-accent text-inverse',
    destructive: 'bg-destructive text-inverse',
    notice: 'bg-notice text-inverse',
  },
  secondary: {
    default: 'bg-accent-secondary text-accent',
    destructive: 'bg-destructive-secondary text-destructive',
    notice: 'bg-notice-secondary text-notice',
    neutral: 'bg-secondary text-secondary',
  },
}

export const Tag = ({
  className,
  children,
  color = 'default',
  variant = 'default',
  narrow,
  onClose,
}: TagProps) => {
  return (
    <span
      className={cn(
        'ox-tag',
        `variant-${variant}`,
        'inline-flex items-center whitespace-nowrap rounded px-1 text-mono-sm',
        tagColors[variant][color],
        narrow ? 'h-4' : 'h-6',
        className
      )}
    >
      <span>{children}</span>
      {onClose && (
        <button type="button" className="flex cursor-pointer" onClick={onClose}>
          <Close8Icon
            className={cn(variant === 'default' ? 'text-inverse' : 'text-accent', 'ml-1')}
          />
        </button>
      )}
    </span>
  )
}
