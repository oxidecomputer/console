import React from 'react'
import cn from 'classnames'
import { Close8Icon } from '../icons'

export type TagColor = 'green' | 'red' | 'yellow' | 'gray'
export type TagVariant = 'solid' | 'dim'

export interface TagProps {
  color?: TagColor
  className?: string
  children: React.ReactNode
  variant?: TagVariant
  narrow?: boolean
  onClose?: () => void
}

export const tagColors: Record<
  TagVariant,
  Partial<Record<TagColor, string>>
> = {
  solid: {
    green: 'bg-accent-solid text-inverse',
    red: 'bg-destructive-solid text-inverse',
    yellow: 'bg-notice-solid text-inverse',
  },
  dim: {
    green: 'bg-accent-dim text-accent',
    red: 'bg-destructive-dim text-destructive',
    yellow: 'bg-notice-dim text-notice',
    gray: 'bg-disabled text-secondary',
  },
}

export const Tag = ({
  className,
  children,
  color = 'green',
  variant = 'solid',
  narrow,
  onClose,
}: TagProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-sm px-1 text-mono-sm',
        tagColors[variant][color],
        narrow ? 'h-4' : 'h-6',
        className
      )}
    >
      <span>{children}</span>
      {onClose && (
        <button type="button" className="flex cursor-pointer" onClick={onClose}>
          <Close8Icon
            className={cn(
              variant === 'solid' ? 'text-inverse' : 'text-accent',
              'ml-1'
            )}
          />
        </button>
      )}
    </span>
  )
}
