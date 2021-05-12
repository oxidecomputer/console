import React from 'react'

import tw from 'twin.macro'
import { Icon } from '../icon/Icon'

export const badgeColors = [
  'gray',
  'red',
  'yellow',
  'green',
  'blue',
  'purple',
] as const
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
  sm: tw`h-4 text-xxs`,
  base: tw`h-6 text-xs`,
  xl: tw`h-8 text-sm`,
}

const text = {
  sm: {
    base: tw`margin[5px]`,
    closable: tw`ml-2 mr-1.5`,
    notification: tw`mx-1.5`,
  },
  base: {
    base: tw`mx-3`,
    closable: tw`ml-3 mr-1.5`,
    notification: tw`mr-3 ml-1.5`,
  },
  xl: {
    base: tw`mx-4`,
    closable: tw`ml-4 mr-2`,
    notification: tw`ml-2 mr-4`,
  },
}

const notificationIcon = {
  sm: tw`w-2 ml-1.5`,
  base: tw`w-2 margin-left[7px]`,
  xl: tw`w-2 ml-3`,
}

const closeIcon = {
  sm: tw`width[9px] mr-1.5`,
  base: tw`w-3 mr-2`,
  xl: tw`w-4 mr-3`,
}

const colors = {
  gray: tw`bg-gray-600 text-white`,
  red: tw`bg-dark-red text-red-500`,
  yellow: tw`bg-dark-yellow text-yellow-500`,
  green: tw`bg-dark-green-800 text-green-500`,
  blue: tw`bg-dark-blue text-blue-500`,
  purple: tw`bg-dark-purple text-purple-400`,
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
    tw="inline-flex items-center rounded-full uppercase"
    css={[colors[color], wrapper[size]]}
    className={className}
  >
    {variant === 'notification' && (
      <Icon css={notificationIcon[size]} name="dot" />
    )}
    <span css={text[size][variant]}>{children}</span>
    {variant === 'closable' && (
      <button type="button" tw="flex cursor-pointer" onClick={onClose}>
        <Icon name="close" css={closeIcon[size]} />
      </button>
    )}
  </span>
)
