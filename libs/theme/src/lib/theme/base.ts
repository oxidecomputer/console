import { css } from 'styled-components'
import type {
  SpacingHelper,
  SizingMultiplier,
  Theme,
  SpaceBetweenHelper,
} from '../types'
import type { Color } from '../colors'
import { colorDefinitions, colorPalette } from '../colors'

// TODO: Move these functions to their own modules

/**
 * Use one of the colors from the design system. Returns hsl by default and hsla when the optional alpha value is provided.
 *
 * @param name The name of the color
 * @param alpha Optional. Alpha (or transparency) value of the color
 *
 * Usage: `color('green600', 0.6)` `color('black')`
 */
const color = (name: Color, alpha?: number) => {
  const colorValue = colorDefinitions[name]
  if (alpha) {
    return `hsla(${colorValue}, ${alpha})`
  }
  return `hsl(${colorValue})`
}

/**
 * Adds horizontal space between all direct children of this element.
 *
 * @param size The size of the distance between child elements
 * @param reverse Reverses the direction of the spacing
 */
const spaceBetweenX: SpaceBetweenHelper = (size, reverse) => {
  const dir = reverse ? 1 : 0

  return css`
    & > * + * {
      margin-left: ${({ theme }) => theme.spacing(size * (1 - dir))};
      margin-right: ${({ theme }) => theme.spacing(size * dir)};
    }
  `
}

/**
 * Adds vertical space between all direct children of this element.
 *
 * @param size The size of the distance between child elements
 * @param reverse Reverses the direction of the spacing
 */
const spaceBetweenY: SpaceBetweenHelper = (size, reverse) => {
  const dir = reverse ? 1 : 0

  return css`
    & > * + * {
      margin-top: ${({ theme }) => theme.spacing(size * (1 - dir))};
      margin-bottom: ${({ theme }) => theme.spacing(size * dir)};
    }
  `
}

const paddingX: SpacingHelper = (size) => css`
  padding-left: ${({ theme }) => theme.spacing(size)};
  padding-right: ${({ theme }) => theme.spacing(size)};
`

const paddingY: SpacingHelper = (size) => css`
  padding-top: ${({ theme }) => theme.spacing(size)};
  padding-bottom: ${({ theme }) => theme.spacing(size)};
`

const marginX: SpacingHelper = (size) => css`
  margin-left: ${({ theme }) => theme.spacing(size)};
  margin-right: ${({ theme }) => theme.spacing(size)};
`

const marginY: SpacingHelper = (size) => css`
  margin-top: ${({ theme }) => theme.spacing(size)};
  margin-bottom: ${({ theme }) => theme.spacing(size)};
`

// Spacing is based on Tailwind's default spacing scale. See: https://tailwindcss.com/docs/customizing-spacing#default-spacing-scale
// Usage: `theme.spacing(4)` => '1rem' (16px)
//        `theme.spacing([4, 4 ,4 ,4])` => '1rem 1rem 1rem 1rem'
//
// Dev Note: Eventually most commonly used numbers will map to strings e.g. `theme.spacing('small')`
const spacing = (size: SizingMultiplier | SizingMultiplier[]): string => {
  const helper = (n: number): string => `${n * 0.25}rem`

  return Array.isArray(size) ? size.map(helper).join(' ') : helper(size)
}

export const baseTheme: Theme = {
  fonts: {
    sans: `'Inter', sans-serif`,
    mono: `'GT America Mono', monospace`,
  },
  color: color,
  themeColors: colorPalette,

  spacing,
  spaceBetweenX,
  spaceBetweenY,
  paddingX,
  paddingY,
  marginX,
  marginY,
}
