import React from 'react'

import styled, { css } from 'styled-components'

import Icon from '../icon/Icon'

export const avatarSizes = {
  '2xl': { width: 16, fontSize: 6 }, // spacing(16) is 64px, 24px
  xl: { width: 14, fontSize: 5 }, // 56px, 20px
  lg: { width: 12, fontSize: 4.5 }, // 48px, 18px
  base: { width: 10, fontSize: 4 }, // 40px, 16px
  sm: { width: 8, fontSize: 3.5 }, // 32px, 14px
  xs: { width: 6, fontSize: 3 }, // 24px, 12px
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
  hasInitials?: boolean
}

const StyledIcon = styled(Icon).attrs({ name: 'profile', color: 'gray300' })``
const StyledImage = styled.img``

const getSizeStyles = (size) => {
  const avatarSize = avatarSizes[size]
  if (avatarSize) {
    return css`
      height: ${({ theme }) => theme.spacing(avatarSize.width)};
      width: ${({ theme }) => theme.spacing(avatarSize.width)};

      font-size: ${({ theme }) => theme.spacing(avatarSize.fontSize)};

      ${StyledIcon} {
        position: absolute;
        top: 20%;
        right: 0;
        left: 0;

        width: ${({ theme }) => theme.spacing(avatarSize.width)};
      }
    `
  }
}

const Wrapper = styled.div<WrapperProps>`
  ${(props) =>
    props.hasInitials
      ? css`
          align-items: center;
          display: inline-flex;
          justify-content: center;
        `
      : css`
          display: inline-block;
        `};
  vertical-align: middle;

  position: relative;
  overflow: hidden;

  background-color: ${(props) =>
    props.isCircle
      ? props.theme.themeColors.gray100
      : props.theme.themeColors.gray500};
  border-radius: ${(props) => (props.isCircle ? '50%' : '0')};
  font-family: ${(props) => props.theme.fonts.sans};
  line-height: 1;
  text-transform: uppercase;

  ${(props) => getSizeStyles(props.size)};
`

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
        <StyledImage src={src} alt={name} />
      </Wrapper>
    )
  }

  const initials = getInitials(name)
  if (initials && !isPerson) {
    // Fallback: Avatar with initials
    return (
      <Wrapper size={size} hasInitials>
        <abbr title={name}>{initials}</abbr>
      </Wrapper>
    )
  }

  // Fallback: Avatar with a default/placeholder image
  return (
    <Wrapper size={size} isCircle>
      <StyledIcon />
    </Wrapper>
  )
}

Avatar.defaultProps = {
  isPerson: false,
  size: 'base',
}

export default Avatar
