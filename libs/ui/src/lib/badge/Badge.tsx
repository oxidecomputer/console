import React from 'react'
import cn from 'classnames'

import { Icon } from '../icon/Icon'

export const badgeColors = ['gray', 'red', 'yellow', 'green', 'blue'] as const
export type BadgeColor = typeof badgeColors[number]

export const badgeSizes = ['sm', 'base', 'xl'] as const
type Size = typeof badgeSizes[number]

export const badgeVariants = ['base', 'notification', 'closable'] as const
type Variant = 'base' | 'notification' | 'closable'

export interface BadgeProps {
  color?: BadgeColor
  size?: Size
  variant?: Variant
  className?: string
  onClose?: () => void
  children: React.ReactNode
}

const wrapper = {
  sm: 'h-4 text-xxs',
  base: 'h-6 text-xs',
  xl: 'h-8 text-sm',
}

const text = {
  sm: {
    base: 'm-[5px]',
    closable: 'ml-2 mr-1.5',
    notification: 'mx-1.5',
  },
  base: {
    base: 'mx-3',
    closable: 'ml-3 mr-1.5',
    notification: 'mr-3 ml-1.5',
  },
  xl: {
    base: 'mx-4',
    closable: 'ml-4 mr-2',
    notification: 'ml-2 mr-4',
  },
}

const notificationIcon = {
  sm: '!w-2 ml-1.5',
  base: '!w-2 ml-[7px]',
  xl: '!w-2 ml-3',
}

const closeIcon = {
  sm: '!w-[9px] mr-1.5',
  base: '!w-3 mr-2',
  xl: '!w-4 mr-3',
}

const colors = {
  gray: 'bg-gray-400 text-white',
  red: 'bg-red-900 text-red-500',
  yellow: 'bg-yellow-900 text-yellow-500',
  green: 'bg-green-900 text-green-500',
  blue: 'bg-blue-900 text-blue-500',
}

export const Badge = ({
  className,
  children,
  color = 'gray',
  size = 'base',
  variant = 'base',
  onClose,
}: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full uppercase',
      colors[color],
      wrapper[size],
      className
    )}
  >
    {variant === 'notification' && (
      <Icon className={notificationIcon[size]} name="dot" />
    )}
    <span className={text[size][variant]}>{children}</span>
    {variant === 'closable' && (
      <button type="button" className="flex cursor-pointer" onClick={onClose}>
        <Icon name="close" className={closeIcon[size]} />
      </button>
    )}
  </span>
)
