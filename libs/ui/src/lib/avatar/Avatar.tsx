import type { FC } from 'react'
import React, { useMemo } from 'react'

import styled, { css } from 'styled-components'

import type { IconProps } from '../icon/Icon'
import { Icon } from '../icon/Icon'

export const avatarSizes = ['2xl', 'xl', 'lg', 'base', 'sm', 'xs'] as const
export type AvatarSize = typeof avatarSizes[number]

const sizeMap: Record<AvatarSize, { width: number; fontSize: number }> = {
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
   * Only persons/individuals should have a circular shape
   */
  isPerson?: boolean
  /**
   * Override the default size of image
   */
  size?: AvatarSize
  /**
   * The url for the image (`<img>`) tag to use
   * */
  src?: string
}

type WrapperProps = Omit<AvatarProps, 'name' | 'isPerson'> & {
  isCircle?: boolean
  hasInitials?: boolean
}

const StyledIcon = styled(Icon).attrs({
  name: 'profile',
  color: 'gray300',
})<IconProps>``

const getSizeStyles = (size: AvatarSize) => {
  const avatarSize = sizeMap[size]
  if (avatarSize) {
    return css`
      height: ${({ theme }) => theme.spacing(avatarSize.width)};
      width: ${({ theme }) => theme.spacing(avatarSize.width)};

      font-size: ${({ theme }) => theme.spacing(avatarSize.fontSize)};

      ${StyledIcon} {
        position: absolute;
        top: 18%;
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

  position: relative;
  overflow: hidden;
  vertical-align: middle;

  background-color: ${(props) =>
    props.isCircle
      ? props.theme.themeColors.gray100
      : props.theme.themeColors.gray500};
  border-radius: ${(props) => (props.isCircle ? '50%' : '0')};
  font-family: ${(props) => props.theme.fonts.sans};
  line-height: 1;
  text-transform: uppercase;

  ${({ size }) => size && getSizeStyles(size)};
`

const IconAvatar: React.FC<Pick<AvatarProps, 'name' | 'isPerson' | 'size'>> = ({
  name,
  isPerson,
  size,
}) => {
  return (
    <Wrapper size={size} isCircle={isPerson}>
      <StyledIcon svgProps={{ title: name }} />
    </Wrapper>
  )
}

const ImageAvatar: React.FC<AvatarProps> = ({ name, isPerson, size, src }) => {
  return (
    <Wrapper size={size} isCircle={isPerson}>
      <img src={src} alt={name} />
    </Wrapper>
  )
}

const InitialsAvatar: React.FC<Pick<AvatarProps, 'name' | 'size'>> = ({
  name,
  size,
}) => {
  const initials = useMemo(
    () =>
      name
        .split(' ')
        .filter((hasValue) => !!hasValue)
        .map((subname) => subname[0])
        .slice(0, 2)
        .join(''),
    [name]
  )

  if (initials) {
    return (
      <Wrapper size={size} hasInitials>
        <abbr title={name}>{initials}</abbr>
      </Wrapper>
    )
  }

  console.warn('Initials were not found for the organization: ', name)
  return <IconAvatar name={name} isPerson={false} size={size} />
}

export const Avatar: FC<AvatarProps> = ({ name, isPerson, size, src }) => {
  if (src) {
    return <ImageAvatar name={name} isPerson={isPerson} size={size} src={src} />
  }

  if (!isPerson) {
    // Group/Org Fallback: Avatar with initials
    return <InitialsAvatar name={name} size={size} />
  }

  // Person Fallback: Avatar with a custom profile icon
  return <IconAvatar name={name} isPerson={isPerson} size={size} />
}

Avatar.defaultProps = {
  isPerson: false,
  size: 'base',
}

export default Avatar
