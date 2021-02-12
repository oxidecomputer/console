import React from 'react'
import styled, { css } from 'styled-components'

const getSizeStyles = (size: SizeProp) => {
  switch (size) {
    case 'xxs':
      return css`
        font-size: 0.6875rem;
        line-height: ${1 / 0.6875};
      `
    case 'xs':
      return css`
        font-size: 0.75rem;
        line-height: ${1 / 0.75};
      `
    case 'sm':
      return css`
        font-size: 0.875rem;
        line-height: ${1.25 / 0.875};
      `
    case 'lg':
      return css`
        font-size: 1.125rem;
        line-height: ${1.75 / 1.125};
      `
    case 'xl':
      return css`
        font-size: 1.25rem;
        line-height: ${1.75 / 1.25};
      `
    case '2xl':
      return css`
        font-size: 1.5rem;
        line-height: ${2 / 1.5};
      `
    case '3xl':
      return css`
        font-size: 1.875rem;
        line-height: ${2.25 / 1.875};
      `
    case '4xl':
      return css`
        font-size: 2.25rem;
        line-height: ${2.5 / 2.25};
      `
    case '5xl':
      return css`
        font-size: 3rem;
        line-height: 1;
      `
    case '6xl':
      return css`
        font-size: 3.75rem;
        line-height: 1;
      `
    case '7xl':
      return css`
        font-size: 4.5rem;
        line-height: 1;
      `
    case '8xl':
      return css`
        font-size: 6rem;
        line-height: 1;
      `
    case '9xl':
      return css`
        font-size: 8rem;
        line-height: 1;
      `
    case 'base':
    default:
      return css`
        font-size: 1rem;
        line-height: 1.5;
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

type SizeProp =
  | 'xxs'
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | '8xl'
  | '9xl'

export interface TextProps {
  /**
   * Set the font-family to be sans-serif or monospace
   */
  font?: 'sans' | 'mono'
  /**
   * Set the size of the text
   */
  size?: SizeProp
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
