import type { Theme } from '../types'
import type { Color } from '../colors'
import { colorDefinitions, colorPalette } from '../colors'
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

export const baseTheme: Theme = {
  fonts: {
    sans: `'Inter', sans-serif`,
    mono: `'GT America Mono', monospace`,
  },
  color: color,
  themeColors: colorPalette,

  shadow,
}
