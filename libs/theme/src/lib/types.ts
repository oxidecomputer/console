import 'styled-components'
import type {
  CSSObject,
  FlattenInterpolation,
  FlattenSimpleInterpolation,
  SimpleInterpolation,
  ThemeProps,
} from 'styled-components'
import type { Color, ColorPalette } from './colors'

// Used as a basis for an CSS helper which relies on a base sizing unit.
export type SizingMultiplier = number

// Fonts
export type Font = 'sans' | 'mono'

// Helper functions
export type SpacingHelper = (
  size: SizingMultiplier
) => FlattenInterpolation<ThemeProps<Theme>>

export type Breakpoint = 'xs' | 'sm' | 'lg' | 'xl' | '2xl'
export type BreakpointHelper = (
  breakpoint: Breakpoint
) => (
  first: CSSObject | TemplateStringsArray,
  ...args: SimpleInterpolation[]
) => FlattenSimpleInterpolation

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
  spacing: (...sizes: SizingMultiplier[]) => string
  spaceBetweenX: SpacingHelper
  spaceBetweenY: SpacingHelper
  paddingX: SpacingHelper
  paddingY: SpacingHelper
  marginX: SpacingHelper
  marginY: SpacingHelper
  breakpoint: BreakpointHelper
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
