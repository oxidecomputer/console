import React from 'react'
import styled, { css } from 'styled-components'

export const sizes = [
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
type Size = typeof sizes[number]

const getSizeStyles = (size: typeof sizes[number]) => {
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
    default:
      return css`
        font-size: ${({ theme }) => theme.spacing(4)}; /* 1rem */
        line-height: 1.5; /* 1.5rem */
      `
  }
}

const StyledText = styled.span<TextProps>`
  color: inherit;
  font-weight: ${(props) => props.weight};

  ${(props) => {
    if (props.font === 'sans') {
      return css`
        font-family: ${props.theme.fonts.sans};
      `
    }
    if (props.font === 'mono') {
      return css`
        font-family: ${props.theme.fonts.mono};
      `
    }
  }}

  ${(props) => getSizeStyles(props.size)};
`

export interface TextProps {
  /**
   * Set the font-family to be sans-serif or monospace
   */
  font?: 'sans' | 'mono'
  /**
   * Set the size of the text
   */
  size?: Size
  /**
   * Set the font-weight of the text
   */
  weight?: number
}

export const Text: React.FC<TextProps> = ({ children, ...props }) => {
  return <StyledText {...props}>{children}</StyledText>
}

Text.defaultProps = {
  font: 'sans',
  size: 'base',
  weight: 400,
}

export default Text
