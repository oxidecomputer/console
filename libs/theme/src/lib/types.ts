import 'styled-components'
import type { FlattenSimpleInterpolation } from 'styled-components'
import type { Color, ColorPalette } from './colors'

// Fonts
export type Font = 'sans' | 'mono'

// Helper functions
export type ShadowVariant = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner'
export type ShadowHelper = (
  variant?: ShadowVariant
) => FlattenSimpleInterpolation

// Our Theme type
export interface Theme {
  themeColors: ColorPalette
  color: (name: Color, alpha?: number) => string
  fonts: {
    [key in Font]: string
  }
  shadow: ShadowHelper
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
