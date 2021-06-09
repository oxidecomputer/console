import React, { useMemo } from 'react'
import type { TwStyle } from 'twin.macro'
import tw from 'twin.macro'

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

const sizeStyles: Record<AvatarSize, TwStyle> = {
  xs: tw`w-6 h-6 text-xs svg:w-6`,
  sm: tw`w-8 h-8 text-sm svg:w-8`,
  base: tw`w-10 h-10 text-base svg:w-10`,
  lg: tw`w-12 h-12 text-lg svg:w-12`,
  xl: tw`w-14 h-14 text-xl svg:w-14`,
  '2xl': tw`w-16 h-16 text-2xl svg:w-16`,
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
    <abbr tw="no-underline!" title={name}>
      {initials}
    </abbr>
  ) : (
    <Icon name="profile" tw="text-gray-300" svgProps={{ title: name }} />
  )

  return (
    <div
      tw="font-sans relative overflow-hidden uppercase svg:(absolute top[18%] right-0 left-0)"
      css={[
        sizeStyles[size],
        round ? tw`bg-gray-100 rounded-full` : tw`bg-gray-500`,
        showInitials && tw`inline-flex items-center justify-center`,
      ]}
      className={className}
    >
      {avatar}
    </div>
  )
}

export default Avatar
