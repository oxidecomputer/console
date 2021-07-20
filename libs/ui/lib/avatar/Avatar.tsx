import React, { useMemo } from 'react'
import cn from 'classnames'

import { Icon } from '../icon/Icon'

export const avatarSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl'] as const
export type AvatarSize = typeof avatarSizes[number]

export interface AvatarProps {
  name: string // Name of person, team, project, org, etc.
  round?: boolean
  size?: AvatarSize
  src?: string // image url
  className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs svg:w-6',
  sm: 'w-8 h-8 text-sm svg:w-8',
  base: 'w-10 h-10 text-base svg:w-10',
  lg: 'w-12 h-12 text-lg svg:w-12',
  xl: 'w-14 h-14 text-xl svg:w-14',
  '2xl': 'w-16 h-16 text-2xl svg:w-16',
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter((w) => w)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')

export const Avatar = ({
  className,
  name,
  round = false,
  size = 'base',
  src,
}: AvatarProps) => {
  const initials = useMemo(() => getInitials(name), [name])
  const showInitials = initials && !round

  const avatar = src ? (
    <img src={src} alt={name} />
  ) : showInitials ? (
    <abbr className="!no-underline" title={name}>
      {initials}
    </abbr>
  ) : (
    <Icon
      name="profile"
      className="text-gray-100 text-4xl absolute top-[12%] right-0 left-0"
      svgProps={{ title: name }}
    />
  )

  return (
    <div
      className={cn(
        'font-sans relative overflow-hidden uppercase',
        sizeStyles[size],
        round ? 'bg-gray-50 rounded-full' : 'bg-gray-300',
        showInitials && 'inline-flex items-center justify-center',
        className
      )}
    >
      {avatar}
    </div>
  )
}

export default Avatar
