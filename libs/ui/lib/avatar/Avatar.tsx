import React, { useMemo } from 'react'
import cn from 'classnames'

export const avatarSizes = ['sm', 'base', 'lg'] as const
export type AvatarSize = typeof avatarSizes[number]

export const avatarColors = ['green', 'yellow', 'red'] as const
type AvatarColor = typeof avatarColors[number]

export interface AvatarProps {
  name: string // Name of person, team, project, org, etc.
  round?: boolean
  size?: AvatarSize
  src?: string // image url
  color?: AvatarColor
  className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'w-6 h-6 text-xs',
  base: 'w-8 h-8 text-sm',
  lg: 'w-12 h-12 text-lg',
}

const colorStyles: Record<AvatarColor, string> = {
  green: 'text-green-500 bg-green-900',
  yellow: 'text-yellow-500 bg-yellow-900',
  red: 'text-red-500 bg-red-900',
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
  color = 'green',
  src,
}: AvatarProps) => {
  const initials = useMemo(() => getInitials(name), [name])
  return (
    <div
      className={cn(
        'overflow-hidden inline-flex items-center justify-center',
        round ? 'rounded-full' : 'rounded',
        sizeStyles[size],
        colorStyles[color],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} />
      ) : (
        <abbr className="!no-underline font-sans uppercase" title={name}>
          {initials}
        </abbr>
      )}
    </div>
  )
}

export default Avatar
