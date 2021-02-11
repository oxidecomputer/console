// import original module declarations
import 'styled-components'

type Colors = 'gray' | 'red' | 'yellow' | 'blue' | 'green'
type ColorValues = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
type ColorName = `${Colors}${ColorValues}`

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
  export type ThemeColors = Record<ColorName, string> & {
    white: string
    black: string
  }
  export interface DefaultTheme {
    colors: {
      // TODO: Figure out better names
      mainBg: string
      mainText: string
      mainTextDimmed: string
    }
    themeColors: ThemeColors
    fonts: {
      sans: string
      mono: string
    }
    spacing: (size: SizingMultiplier) => string
  }
}
