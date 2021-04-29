import type { Theme } from '../types'
import { colorPalette } from '@oxide/css-helpers'
import { shadow } from '../shadows'

// TODO: Move these functions to their own modules

export const baseTheme: Theme = {
  fonts: {
    sans: `'Inter', sans-serif`,
    mono: `'GT America Mono', monospace`,
  },
  themeColors: colorPalette,

  shadow,
}
