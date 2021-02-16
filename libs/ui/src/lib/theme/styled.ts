import {
  ThemeProvider as StyledThemeProvider,
  default as styledInterface,
  css as styledCss,
  ThemedStyledInterface,
  BaseThemeProviderComponent,
  ThemedCssFunction,
} from 'styled-components'
import { Theme } from './theme'

export const ThemeProvider: BaseThemeProviderComponent<
  Theme,
  Theme
> = StyledThemeProvider
export const styled: ThemedStyledInterface<Theme> = styledInterface
export const css: ThemedCssFunction<Theme> = styledCss
