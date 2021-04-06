import type { Color } from '@oxide/theme'
import type { FC } from 'react'
import React from 'react'

import styled, { css } from 'styled-components'
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
    iconSizes: Record<VariantWithIcon, number>
    padding: Record<Variant, number[]>
    borderRadius: number
  }
> = {
  sm: {
    textSize: 'xxs',
    iconSizes: { notification: 2, closable: 2 },
    padding: {
      base: [0.5, 1, 0.75],
      notification: [0.5, 2, 0.75, 1],
      closable: [0.5, 1, 0.75, 2],
    },
    borderRadius: 4,
  },
  base: {
    textSize: 'xs',
    iconSizes: { notification: 2, closable: 3 },
    padding: {
      base: [1.5, 3],
      notification: [1.5, 3, 1.5, 2],
      closable: [1.5, 2, 1.5, 3],
    },
    borderRadius: 6,
  },
  xl: {
    textSize: 'sm',
    iconSizes: { notification: 2, closable: 4 },
    padding: {
      base: [2.75, 4],
      notification: [2.75, 4, 2.75, 3],
      closable: [2.75, 3, 2.75, 4],
    },
    borderRadius: 8,
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
  radius: number
}>`
  position: relative;

  display: inline-flex;
  justify-content: center;

  background-color: ${({ theme, background }) => theme.color(background)};

  ${({ theme, padding }) => css`
    padding: ${theme.spacing(padding)};
  `}

  border-radius: ${({ theme, radius }) => theme.spacing(radius)};
`

const BadgeText = styled(Text)<{ textColor: Color }>`
  text-transform: uppercase;
  color: ${({ theme, textColor }) => theme.color(textColor)};
  line-height: 1;
`

const StyledIcon = styled(Icon)<{ iconSize?: number }>`
  ${({ theme, iconSize }) =>
    iconSize &&
    css`
      width: ${theme.spacing(iconSize)};
    `}
`

const StyledButton = styled.button<{ size: number }>`
  background: none;
  border: none;
  margin: 0;
  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: ${({ theme, size }) => theme.spacing(size)};
`

export const Badge: FC<BadgeProps> = ({
  className,
  children,
  color = 'gray',
  size = 'base',
  variant = 'base',
  onClose,
}) => {
  const { background, text } = colorMap[color]
  const { textSize, iconSizes, padding, borderRadius } = sizeMap[size]

  return (
    <StyledBadge
      className={className}
      background={background}
      padding={padding[variant]}
      radius={borderRadius}
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
        <StyledButton
          size={iconSizes.closable}
          type="button"
          onClick={() => onClose && onClose()}
        >
          <StyledIcon color={text} name="close" align="right" />
        </StyledButton>
      )}
    </StyledBadge>
  )
}
