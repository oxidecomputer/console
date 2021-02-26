import React from 'react'

import styled from 'styled-components'

export const avatarSizes = {
  '2xl': 16, // spacing(16) is 64px
  xl: 14, // 56px
  lg: 12, // 48px
  base: 10, // 40px
  sm: 8, // 32px
  xs: 6, // 24px
}

export interface AvatarProps {
  /**
   * Name of person, team, project, org, etc. Required for 'alt' image tag and for finding initials.
   */
  name: string
  /**
   * Persons should be circiular shape and fallback to initials
   */
  isPerson: boolean
  /**
   * Override the default size of image
   */
  size?: keyof typeof avatarSizes
  /**
   * The url for the image (`<img>`) tag to use
   * */
  src?: 'string'
}

type WrapperProps = Omit<AvatarProps, 'name' | 'isPerson'> & {
  isCircle?: boolean
}

const Wrapper = styled.div<WrapperProps>`
  align-items: center;
  display: inline-flex;
  justify-content: center;

  height: ${(props) => props.theme.spacing(avatarSizes[props.size])};
  width: ${(props) => props.theme.spacing(avatarSizes[props.size])};

  background-color: ${(props) => props.theme.themeColors.gray500};
  border-radius: ${(props) => (props.isCircle ? '50%' : '0')};
  font-family: ${(props) => props.theme.fonts.sans};
  text-transform: uppercase;
`

export const Avatar: React.FC<AvatarProps> = ({
  name,
  isPerson,
  src,
  size,
}) => {
  if (src) {
    // Avatar with image
    return (
      <Wrapper size={size} isCircle={isPerson}>
        <img src={src} alt={name} />
      </Wrapper>
    )
  }

  const getInitials = (name) => {
    const hasName = typeof name === 'string' && !!name.length
    if (hasName) {
      return name
        .split(' ')
        .filter((hasValue) => !!hasValue)
        .map((subname) => subname[0])
        .slice(0, 2)
        .join('')
    }
    return null
  }

  const initials = getInitials(name)
  if (initials && !isPerson) {
    // Fallback: Avatar with initials
    return <Wrapper size={size}>{initials}</Wrapper>
  }
  // Fallback: Avatar with a default/placeholder image
  return (
    <Wrapper size={size} isCircle>
      TODO
    </Wrapper>
  )
}

Avatar.defaultProps = {
  isPerson: false,
  size: 'base',
}

export default Avatar
