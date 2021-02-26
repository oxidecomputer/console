import {
  css,
  DefaultTheme as Theme,
  SpaceBetweenHelper,
} from 'styled-components'
import { colorPalette } from '../colors'

// TODO: Move these functions to their own modules

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
  themeColors: colorPalette,

  // Spacing is based on Tailwind's default spacing scale. See: https://tailwindcss.com/docs/customizing-spacing#default-spacing-scale
  // Usage: `theme.spacing(4)` => '1rem' (16px)
  //
  // Dev Note: Eventually most commonly used numbers will map to strings e.g. `theme.spacing('small')`
  spacing: (size) => `${size * 0.25}rem`,
  spaceBetweenX,
  spaceBetweenY,
}
