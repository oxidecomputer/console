import type { Color, ColorPalette } from './types'
import { colorDefinitions } from './values'

export * from './types'

export const colorNames = Object.keys(colorDefinitions) as Color[]
export const colorPalette: ColorPalette = colorNames.reduce((palette, name) => {
  return { ...palette, [name]: `hsl(${colorDefinitions[name]})` }
}, {} as ColorPalette)

/**
 * Use one of the colors from the design system. Returns hsl by default and hsla when the optional alpha value is provided.
 *
 * @param name The name of the color
 * @param alpha Optional. Alpha (or transparency) value of the color
 *
 * Usage: `color('green600', 0.6)` `color('black')`
 */
export const color = (name: Color, alpha?: number) => {
  const colorValue = colorDefinitions[name]
  if (alpha) {
    return `hsla(${colorValue}, ${alpha})`
  }
  return `hsl(${colorValue})`
}
