import 'styled-components'
import type { FlattenInterpolation, ThemeProps } from 'styled-components'

// Used as a basis for an CSS helper which relies on a base sizing unit.
type SizingMultiplier = number

// Colors
export const colorGroups = ['gray', 'red', 'yellow', 'blue', 'green'] as const
export type ColorGroup = typeof colorGroups[number]
export const colorValues = [
  50,
  100,
  200,
  300,
  400,
  500,
  600,
  700,
  800,
  900,
] as const
export type ColorValues = typeof colorValues[number]
export type Color = `${ColorGroup}${ColorValues}` | 'white' | 'black'
export type ColorPalette = Record<Color, string>

// Fonts
export type Font = 'sans' | 'mono'

// Helper functions
export type SpacingHelper = (
  size: SizingMultiplier
) => FlattenInterpolation<ThemeProps<Theme>>

// Our Theme type
export interface Theme {
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
  marginX: SpacingHelper
  marginY: SpacingHelper
}

// Extend styled-components with our Theme type
declare module 'styled-components' {
  /* 
  Styled's type system uses declaration merging to type the theme. To allow 
  importing the theme type from this library, instead of going through 
  `styled-components` we can merge on an extention of an internal interface.

  See here: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
  Also here: https://blog.agney.dev/styled-components-&-typescript/#3-typing-the-theme
  */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}
