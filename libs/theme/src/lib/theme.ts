import 'styled-components'
import { ColorPalette } from './colors'

type SizingMultiplier =
  | 0.5
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 16
  | 20
  | 24
  | 32
  | 40
  | 48
  | 56
  | 64

// Extend the styled-components
declare module 'styled-components' {
  export interface DefaultTheme {
    themeColors: ColorPalette
    fonts: {
      sans: string
      mono: string
    }
    spacing: (size: SizingMultiplier) => string
  }
}
