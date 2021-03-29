import { css } from 'styled-components'
import { baseTheme } from './theme/base'

export const spacing = baseTheme.spacing
export const spaceBetweenX = baseTheme.spaceBetweenX
export const spaceBetweenY = baseTheme.spaceBetweenY
export const paddingX = baseTheme.paddingX
export const paddingY = baseTheme.paddingY
export const marginX = baseTheme.marginX
export const marginY = baseTheme.marginY
export const color = baseTheme.color

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

export const textSize = (size: TextSize) => {
  switch (size) {
    case 'xxs':
      return css`
        font-size: 0.6875rem; /* spacing(2.75) */
        line-height: ${1 / 0.6875}; /* 1rem */
      `
    case 'xs':
      return css`
        font-size: ${spacing(3)}; /* 0.75rem */
        line-height: ${1 / 0.75}; /* 1rem */
      `
    case 'sm':
      return css`
        font-size: ${spacing(3.5)}; /* 0.875rem */
        line-height: ${1.25 / 0.875}; /* 1.25rem */
      `
    case 'lg':
      return css`
        font-size: ${spacing(4.5)}; /* 1.125rem */
        line-height: ${1.75 / 1.125}; /* 1.75rem */
      `
    case 'xl':
      return css`
        font-size: ${spacing(5)}; /* 1.25rem */
        line-height: 1.4; /* 1.75rem */
      `
    case '2xl':
      return css`
        font-size: ${spacing(6)}; /* 1.5rem */
        line-height: ${2 / 1.5}; /* 2rem */
      `
    case '3xl':
      return css`
        font-size: 1.875rem; /* spacing(7.5) */
        line-height: 1.2; /* 2.25rem */
      `
    case '4xl':
      return css`
        font-size: ${spacing(9)}; /* 2.25rem */
        line-height: ${2.5 / 2.25}; /* 2.5rem */
      `
    case '5xl':
      return css`
        font-size: ${spacing(12)}; /* 3rem */
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
        font-size: ${spacing(24)}; /* 6rem */
        line-height: 1; /* 6rem */
      `
    case '9xl':
      return css`
        font-size: ${spacing(32)}; /* 8rem */
        line-height: 1; /* 8rem */
      `
    case 'base':
      return css`
        font-size: ${spacing(4)}; /* 1rem */
        line-height: 1.5; /* 1.5rem */
      `
  }
}
