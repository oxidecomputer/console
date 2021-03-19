import React, { FC } from 'react'
import styled, { css } from 'styled-components'
import { Color, Font } from '@oxide/theme'
import { Icon, IconProps } from '../icon/Icon'

export const textSizes = [
  'xxs',
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
  '7xl',
  '8xl',
  '9xl',
] as const
type TextSize = typeof textSizes[number]

const getSizeStyles = (size?: TextSize) => {
  if (!size) return

  switch (size) {
    case 'xxs':
      return css`
        font-size: 0.6875rem; /* spacing(2.75) */
        line-height: ${1 / 0.6875}; /* 1rem */
      `
    case 'xs':
      return css`
        font-size: ${({ theme }) => theme.spacing(3)}; /* 0.75rem */
        line-height: ${1 / 0.75}; /* 1rem */
      `
    case 'sm':
      return css`
        font-size: 0.875rem; /* spacing(3.5) */
        line-height: ${1.25 / 0.875}; /* 1.25rem */
      `
    case 'lg':
      return css`
        font-size: 1.125rem; /* spacing(4.5) */
        line-height: ${1.75 / 1.125}; /* 1.75rem */
      `
    case 'xl':
      return css`
        font-size: ${({ theme }) => theme.spacing(5)}; /* 1.25rem */
        line-height: 1.4; /* 1.75rem */
      `
    case '2xl':
      return css`
        font-size: ${({ theme }) => theme.spacing(6)}; /* 1.5rem */
        line-height: ${2 / 1.5}; /* 2rem */
      `
    case '3xl':
      return css`
        font-size: 1.875rem; /* spacing(7.5) */
        line-height: 1.2; /* 2.25rem */
      `
    case '4xl':
      return css`
        font-size: ${({ theme }) => theme.spacing(9)}; /* 2.25rem */
        line-height: ${2.5 / 2.25}; /* 2.5rem */
      `
    case '5xl':
      return css`
        font-size: ${({ theme }) => theme.spacing(9)}; /* 3rem */
        line-height: 1; /* 3rem */
      `
    case '6xl':
      return css`
        font-size: 3.75rem; /* spacing(15) */
        line-height: 1; /* 3.75rem */
      `
    case '7xl':
      return css`
        font-size: 4.5rem; /* spacing(18) */
        line-height: 1; /* 4.5rem */
      `
    case '8xl':
      return css`
        font-size: ${({ theme }) => theme.spacing(24)}; /* 6rem */
        line-height: 1; /* 6rem */
      `
    case '9xl':
      return css`
        font-size: ${({ theme }) => theme.spacing(32)}; /* 8rem */
        line-height: 1; /* 8rem */
      `
    case 'base':
      return css`
        font-size: ${({ theme }) => theme.spacing(4)}; /* 1rem */
        line-height: 1.5; /* 1.5rem */
      `
  }
}

type Variant = 'base' | 'title'
const getVariantStyles = (variant?: Variant) => {
  switch (variant) {
    case 'title':
      return css`
        ${getSizeStyles('2xl')};
        color: ${({ theme }) => theme.color('green500')};
        font-family: ${({ theme }) => theme.fonts.mono};
        font-weight: 400;
        text-transform: uppercase;
      `
    case 'base':
    default:
      return null
  }
}

type IconType = { align: 'left' | 'right' } & IconProps
const getIconStyles = (hasIcon: boolean) => {
  if (hasIcon) {
    return css`
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: top;
    `
  }
  return null
}

export interface TextProps {
  /**
   * Set a color from theme, otherwise color will default to inherit
   */
  color?: Color
  /**
   * Set the font-family to be sans-serif or monospace
   */
  font?: Font
  hasIcon?: boolean
  /**
   * Display an icon
   */
  icon?: IconType
  /**
   * Set the size of the text
   */
  size?: TextSize
  /**
   * Set the font-weight of the text
   */
  weight?: number
  /**
   * Common variant styles for text
   */
  variant?: Variant
}

const StyledText = styled.span.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    // Do not pass color or size directly to DOM
    !['color', 'size'].includes(prop) && defaultValidatorFn(prop),
})<TextProps>`
  ${({ color, theme }) => {
    if (color) {
      return css`
        color: ${theme.color(color)};
      `
    }
    return css`
      color: inherit;
    `
  }}
  ${({ weight }) =>
    weight &&
    css`
      font-weight: ${weight};
    `};

  ${({ font, theme }) => {
    if (font) {
      return css`
        font-family: ${theme.fonts[font]};
      `
    }
  }}

  ${({ hasIcon }) => getIconStyles(hasIcon)};
  ${({ size }) => getSizeStyles(size)};
  ${({ variant }) => getVariantStyles(variant)};
`

export const Text: FC<TextProps> = ({
  children,
  font = 'sans',
  icon,
  size = 'base',
  weight = 400,
  variant = 'base',
  ...rest
}) => {
  if (icon) {
    const { align = 'left' } = icon
    const renderChildren =
      align === 'right' ? (
        <>
          {children} <Icon align={align} {...icon} />
        </>
      ) : (
        <>
          <Icon align={align} {...icon} /> {children}
        </>
      )
    return (
      <StyledText
        font={font}
        size={size}
        weight={weight}
        variant={variant}
        hasIcon
        {...rest}
      >
        {renderChildren}
      </StyledText>
    )
  }
  return (
    <StyledText
      font={font}
      size={size}
      weight={weight}
      variant={variant}
      {...rest}
    >
      {children}
    </StyledText>
  )
}

export default Text
