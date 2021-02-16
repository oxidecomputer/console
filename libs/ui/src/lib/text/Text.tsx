import React from 'react'
import { styled, css } from '../theme'

const getSizeStyles = (size: SizeProp) => {
  switch (size) {
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

export const Text = styled.span<TextProps>`
  color: inherit;
  font-family: ${(props) => props.theme.fonts.sans};
  font-weight: ${(props) => props.weight};

  ${(props) => getSizeStyles(props.size)};
`

type SizeProp =
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
  size?: SizeProp
  weight?: number
}

Text.defaultProps = {
  size: 'base',
  weight: 400,
}

export default Text
