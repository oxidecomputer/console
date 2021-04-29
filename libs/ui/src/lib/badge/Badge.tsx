import { spacing } from '@oxide/css-helpers'
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
    icons: Record<VariantWithIcon, { size: number; margin: number }>
    padding: Record<Variant, number[]>
  }
> = {
  sm: {
    textSize: 'xxs',
    icons: {
      notification: { size: 2, margin: 1.25 },
      closable: { size: 2, margin: 1.25 },
    },
    padding: {
      base: [0.5, 1.25, 0.75],
      notification: [0.5, 2, 0.75, 1.75],
      closable: [0.5, 2, 0.75],
    },
  },
  base: {
    textSize: 'xs',
    icons: {
      notification: { size: 2, margin: 1.75 },
      closable: { size: 3, margin: 1.5 },
    },
    padding: {
      base: [1.5, 3],
      notification: [1.5, 3, 1.5, 2],
      closable: [1.5, 2.5],
    },
  },
  xl: {
    textSize: 'sm',
    icons: {
      notification: { size: 2, margin: 2.25 },
      closable: { size: 4, margin: 2.75 },
    },
    padding: {
      base: [2.75, 4],
      notification: [2.75, 4, 2.75, 3.25],
      closable: [2.5, 3.5, 2.5, 4],
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
  padding: ${({ padding }) => spacing(...padding)};

  border-radius: 9999px;
`

const BadgeText = styled(Text)<{ textColor: Color }>`
  text-transform: uppercase;
  color: ${({ theme, textColor }) => theme.color(textColor)};
  line-height: 1;
`

const StyledIcon = styled(Icon)<{ iconSize?: number }>`
  ${({ iconSize }) =>
    iconSize &&
    css`
      width: ${spacing(iconSize)};
    `}
`

const NotificationIcon = styled(StyledIcon).attrs({ name: 'dot' })<{
  margin: number
}>`
  margin-right: ${({ margin }) => spacing(margin)};
`

const StyledButton = styled.button<{
  size: number
  margin: number
}>`
  background: none;
  border: none;
  margin: 0;
  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: ${({ size }) => spacing(size)};
  margin-left: ${({ margin }) => spacing(margin)};
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
  const {
    textSize,
    icons: { notification, closable },
    padding,
  } = sizeMap[size]

  return (
    <StyledBadge
      className={className}
      background={background}
      padding={padding[variant]}
    >
      {variant === 'notification' && (
        <NotificationIcon
          margin={notification.margin}
          iconSize={notification.size}
          color={text}
        />
      )}
      <BadgeText size={textSize} textColor={text}>
        {children}
      </BadgeText>
      {variant === 'closable' && (
        <StyledButton
          size={closable.size}
          margin={closable.margin}
          type="button"
          onClick={() => onClose && onClose()}
        >
          <StyledIcon color={text} name="close" />
        </StyledButton>
      )}
    </StyledBadge>
  )
}
