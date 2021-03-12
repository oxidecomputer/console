import 'styled-components'

// Used as a basis for an CSS helper which relies on a base sizing unit.
type SizingMultiplier = number

// Colors
type ColorNames = 'gray' | 'red' | 'yellow' | 'blue' | 'green'
type ColorValues = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

export type Color = `${ColorNames}${ColorValues}` | 'white' | 'black'
export type ColorPalette = Record<Color, string>

// Fonts
export type Font = 'sans' | 'mono'

// Helper functions

// Extend styled-components with our Theme type
declare module 'styled-components' {
  export type SpacingHelper = (
    size: SizingMultiplier
  ) => FlattenInterpolation<ThemeProps<DefaultTheme>>

  export interface DefaultTheme {
    themeColors: ColorPalette
    color: (name: Color, alpha?: number) => string
    fonts: {
      [key in Font]: string
    }
    spacing: (size: SizingMultiplier) => string
    spaceBetweenX: SpacingHelper
    spaceBetweenY: SpacingHelper
    paddingX: SpacingHelper
    paddingY: SpacingHelper
  }
}
