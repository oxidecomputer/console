import { color, spacing } from '@oxide/css-helpers'
import type { FC } from 'react'
import React from 'react'

import { styled } from 'twin.macro'
import type { AvatarSize, AvatarProps } from '../avatar/Avatar'
import { Avatar } from '../avatar/Avatar'

export interface AvatarStackProps {
  data: Array<AvatarProps>
  size?: AvatarSize
}

const StyledAvatar = styled(Avatar)``

const Wrapper = styled.div`
  display: flex;
  flex-direction: nowrap;

  ${StyledAvatar} {
    margin-left: ${spacing(-2)};
    box-shadow: 0 0 0 2px ${color('gray900')};
  }
`

export const AvatarStack: FC<AvatarStackProps> = ({ data, size = 'base' }) => {
  if (!data) {
    return null
  }
  return (
    <Wrapper>
      {data.map((avatarProps, index) => {
        return (
          <StyledAvatar
            key={`avatar-stack-${index}`}
            size={size}
            {...avatarProps}
          />
        )
      })}
    </Wrapper>
  )
}
