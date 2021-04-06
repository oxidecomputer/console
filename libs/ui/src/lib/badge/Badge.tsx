import type { Color } from '@oxide/theme'
import type { FC } from 'react'
import React from 'react'

import styled, { css } from 'styled-components'
import type { ButtonSize } from '../button/Button'
import Button from '../button/Button'
import Icon from '../icon/Icon'
import type { TextSize } from '../text/Text'
import Text from '../text/Text'

export const badgeColors = [
  'gray',
  'red',
  'yellow',
  'green',
  'blue',
  'purple',
] as const
type BadgeColor = typeof badgeColors[number]

export const badgeSizes = ['sm', 'base', 'xl'] as const
type Size = typeof badgeSizes[number]

export const badgeVariants = ['base', 'notification', 'closable'] as const
// This separation helps keep the sizeMap simpler, so we don't have to define icon positionings for variants with no icons
type VariantWithIcon = 'notification' | 'closable'
type Variant = 'base' | VariantWithIcon

export interface BadgeProps {
  color?: BadgeColor
  size?: Size
  variant?: Variant

  className?: string

  onClose?: () => void
}

const sizeMap: Record<
  Size,
  {
    textSize: TextSize
    iconSizes: {
      notification: number
      closable: ButtonSize
    }
    padding: Record<Variant, number[]>
  }
> = {
  sm: {
    textSize: 'xxs',
    iconSizes: { notification: 2, closable: 'xs' },
    padding: {
      base: [0, 1],
      notification: [0, 2, 0, 1],
      closable: [0, 1, 0, 2],
    },
  },
  base: {
    textSize: 'sm',
    iconSizes: { notification: 2, closable: 'sm' },
    padding: {
      base: [1, 3],
      notification: [1, 3, 1, 2],
      closable: [1, 2, 1, 3],
    },
  },
  xl: {
    textSize: 'sm',
    iconSizes: { notification: 2, closable: 'sm' },
    padding: {
      base: [2, 4],
      notification: [2, 4, 2, 3],
      closable: [2, 3, 2, 4],
    },
  },
}

const colorMap: Record<BadgeColor, { background: Color; text: Color }> = {
  gray: { background: 'gray600', text: 'white' },
  red: { background: 'darkBgRed', text: 'red500' },
  yellow: { background: 'darkBgYellow', text: 'yellow500' },
  green: { background: 'darkBgGreen', text: 'green500' },
  blue: { background: 'darkBgBlue', text: 'blue500' },
  purple: { background: 'darkBgPurple', text: 'purple400' },
}

const StyledBadge = styled.span<{
  background: Color
  padding: number[]
}>`
  position: relative;

  display: inline-flex;
  justify-content: center;

  background-color: ${({ theme, background }) => theme.color(background)};

  ${({ theme, padding }) => css`
    padding: ${theme.spacing(padding)};
  `}

  border-radius: 1em;
`

const BadgeText = styled(Text).attrs({ size: 'sm' })<{ textColor: Color }>`
  text-transform: uppercase;
  color: ${({ theme, textColor }) => theme.color(textColor)};
  line-height: 1;
`

const StyledIcon = styled(Icon)<{ iconSize?: number; pointer?: boolean }>`
  ${({ theme, iconSize }) =>
    iconSize &&
    css`
      width: ${theme.spacing(iconSize)};
    `}
  ${({ pointer }) =>
    pointer &&
    css`
      cursor: pointer;
    `}
`

export const Badge: FC<BadgeProps> = ({
  className,
  children,
  color = 'gray',
  size = 'base',
  variant = 'base',
  onClose = () => null,
}) => {
  const { background, text } = colorMap[color]
  const { textSize, iconSizes, padding } = sizeMap[size]

  return (
    <StyledBadge
      className={className}
      background={background}
      padding={padding[variant]}
    >
      {variant === 'notification' && (
        <StyledIcon
          name="dot"
          iconSize={iconSizes.notification}
          color={text}
          align="left"
        />
      )}
      <BadgeText size={textSize} textColor={text}>
        {children}
      </BadgeText>
      {variant === 'closable' && (
        <Button
          variant="link"
          onClick={() => onClose && onClose()}
          size={iconSizes.closable}
        >
          <StyledIcon color={text} name="close" align="right" pointer />
        </Button>
      )}
    </StyledBadge>
  )
}
