import { spacing } from '@oxide/css-helpers'
import React from 'react'

import type { TwStyle } from 'twin.macro'
import tw, { css, styled } from 'twin.macro'
import Icon from '../icon/Icon'

export const badgeColors = [
  'gray',
  'red',
  'yellow',
  'green',
  'blue',
  'purple',
] as const
export type BadgeColor = typeof badgeColors[number]

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
  children: React.ReactNode
}

const sizeMap: Record<
  Size,
  {
    textSize: TwStyle
    icons: Record<VariantWithIcon, { size: number; margin: number }>
    padding: Record<Variant, number[]>
  }
> = {
  sm: {
    textSize: tw`text-xxs`,
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
    textSize: tw`text-xs`,
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
    textSize: tw`text-sm`,
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

const colorMap = {
  gray: { bgColor: tw`bg-gray-600`, textColor: tw`text-white` },
  red: { bgColor: tw`bg-dark-red`, textColor: tw`text-red-500` },
  yellow: { bgColor: tw`bg-dark-yellow`, textColor: tw`text-yellow-500` },
  green: { bgColor: tw`bg-dark-green-800`, textColor: tw`text-green-500` },
  blue: { bgColor: tw`bg-dark-blue`, textColor: tw`text-blue-500` },
  purple: { bgColor: tw`bg-dark-purple`, textColor: tw`text-purple-400` },
}

const StyledBadge = styled.span<{
  padding: number[]
}>`
  position: relative;

  display: inline-flex;
  justify-content: center;

  padding: ${({ padding }) => spacing(...padding)};

  border-radius: 9999px;
`

const BadgeText = tw.span`uppercase line-height[1]!`

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

export const Badge = ({
  className,
  children,
  color = 'gray',
  size = 'base',
  variant = 'base',
  onClose,
}: BadgeProps) => {
  const { bgColor, textColor } = colorMap[color]
  const {
    textSize,
    icons: { notification, closable },
    padding,
  } = sizeMap[size]

  return (
    <StyledBadge className={className} css={bgColor} padding={padding[variant]}>
      {variant === 'notification' && (
        <NotificationIcon
          margin={notification.margin}
          iconSize={notification.size}
          css={[textColor]}
        />
      )}
      <BadgeText css={[textSize, textColor]}>{children}</BadgeText>
      {variant === 'closable' && (
        <StyledButton
          size={closable.size}
          margin={closable.margin}
          type="button"
          onClick={() => onClose && onClose()}
        >
          <StyledIcon css={textColor} name="close" />
        </StyledButton>
      )}
    </StyledBadge>
  )
}
