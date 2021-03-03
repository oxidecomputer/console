import {
  css,
  DefaultTheme as Theme,
  SpaceBetweenHelper,
} from 'styled-components'
import { Color } from '../types'
import { colorValues, colorPalette } from '../colors'

// TODO: Move these functions to their own modules

/**
 * Use one of the colors from the design system. Returns hsl by default and hsla when the optional alpha value is provided.
 *
 * @param name The name of the color
 * @param alpha Optional. Alpha (or transparency) value of the color
 *
 * Usage: `color('green600', 0.6)` `color('black')`
 */
const color = (name: Color, alpha?: number): string | null => {
  const colorValue = colorValues[name]
  if (colorValue) {
    if (alpha) {
      return `hsla(${colorValue}, ${alpha})`
    }
    return `hsl(${colorValue})`
  }

  return null
}

/**
 * Adds horizontal space between all direct children of this element.
 *
 * @param size The size of the distance between child elements
 */
const spaceBetweenX: SpaceBetweenHelper = (size) => css`
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
const spaceBetweenY: SpaceBetweenHelper = (size) => css`
  & > * + * {
    margin-top: ${({ theme }) => theme.spacing(size)};
    margin-bottom: 0;
  }
`

export const baseTheme: Theme = {
  fonts: {
    sans: `'Inter', sans-serif`,
    mono: `'GT America Mono', monospace`,
  },
  color: color,
  themeColors: colorPalette,

  // Spacing is based on Tailwind's default spacing scale. See: https://tailwindcss.com/docs/customizing-spacing#default-spacing-scale
  // Usage: `theme.spacing(4)` => '1rem' (16px)
  //
  // Dev Note: Eventually most commonly used numbers will map to strings e.g. `theme.spacing('small')`
  spacing: (size) => `${size * 0.25}rem`,
  spaceBetweenX,
  spaceBetweenY,
}
