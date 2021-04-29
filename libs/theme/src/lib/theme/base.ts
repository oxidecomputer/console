import { css } from 'styled-components'
import type { SpacingHelper, SizingMultiplier, Theme } from '../types'
import type { Color } from '../colors'
import { colorDefinitions, colorPalette } from '../colors'
import { breakpoint } from '../breakpoints'
import { shadow } from '../shadows'

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
 */
const spaceBetweenX: SpacingHelper = (size) => css`
  & > * + * {
    margin-left: ${({ theme }) => theme.spacing(size)};
    margin-right: 0;
  }
`

/**
 * Adds vertical space between all direct children of this element.
 *
 * @param size The size of the distance between child elements
 */
const spaceBetweenY: SpacingHelper = (size) => css`
  & > * + * {
    margin-top: ${({ theme }) => theme.spacing(size)};
    margin-bottom: 0;
  }
`

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
// Usage: `theme.spacing(4)`          => '1rem' (16px)
//        `theme.spacing(4, 4, 4, 4)` => '1rem 1rem 1rem 1rem'
//
// Dev Note: Eventually most commonly used numbers will map to strings e.g. `theme.spacing('small')`
const spacing = (...sizes: SizingMultiplier[]): string =>
  sizes.map((n) => `${n * 0.25}rem`).join(' ')

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
  breakpoint,
  shadow,
}
