import React from 'react'

import { theme } from 'twin.macro'
import type { AvatarSize, AvatarProps } from '../avatar/Avatar'
import { Avatar } from '../avatar/Avatar'

export interface AvatarStackProps {
  data: Array<AvatarProps>
  size?: AvatarSize
}

export const AvatarStack = ({ data, size = 'base' }: AvatarStackProps) => (
  <div tw="flex">
    {data.map((avatarProps) => (
      <Avatar
        tw="-ml-2"
        css={{ boxShadow: `0 0 0 2px ${theme`colors.black`}` }}
        key={`avatar-stack-${avatarProps.name}`}
        size={size}
        {...avatarProps}
      />
    ))}
  </div>
)
