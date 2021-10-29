import React from 'react'
import cn from 'classnames'
import { Close8Icon, Close12Icon } from '../icons'

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
    green: 'bg-green-500 text-black',
    red: 'bg-red-500 text-black',
    yellow: 'bg-yellow-500 text-black',
  },
  dim: {
    green: 'bg-green-950 text-green-500',
    red: 'bg-red-900 text-red-500',
    yellow: 'bg-yellow-900 text-yellow-500',
    gray: 'bg-gray-500 text-gray-100',
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
        'inline-flex items-center uppercase font-mono text-sm font-thin rounded-sm px-1 whitespace-nowrap',
        tagColors[variant][color],
        narrow ? 'h-4' : 'h-6',
        className
      )}
    >
      <span>{children}</span>
      {onClose && (
        <button type="button" className="flex cursor-pointer" onClick={onClose}>
          {narrow ? (
            <Close8Icon
              className={cn(
                variant === 'solid' ? 'text-black' : 'text-green-500',
                'ml-1'
              )}
            />
          ) : (
            <Close12Icon
              className={cn(
                variant === 'solid' ? 'text-black' : 'text-green-500',
                'ml-1'
              )}
            />
          )}
        </button>
      )}
    </span>
  )
}
