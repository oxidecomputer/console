import type { DefaultTheme, ThemedCssFunction } from 'styled-components'
import { css } from 'styled-components'

export type Breakpoint = 'xs' | 'sm' | 'lg' | 'xl' | '2xl'
export const breakpoints: Record<Breakpoint, number> = {
  xs: 320,
  sm: 640,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

type BreakpointHelper = (
  breakpoint: Breakpoint
) => ThemedCssFunction<DefaultTheme>

/**
 * This helper works simlarly to the `css` helper from `styled-components` however, it first takes a breakpoint and only applies the styles for that given breakpoint.
 *
 * ## Usage
 *
 * ```typescript
 * const Container = styled.div`
 *   display: flex;
 *   flex-direction: column;
 *
 *   ${breakpoint('sm')`
 *     flex-direction: row;
 *   `}
 * `
 * ```
 * @param breakpoint The breakpoint to use for the media query
 */
// `first` and `args` are overloaded and typing these properly is a huge pain,
// disabling ts to allow the usage of any here.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const breakpoint: BreakpointHelper = (breakpoint) => (first, ...args) =>
  css`
    @media (min-width: ${breakpoints[breakpoint]}px) {
      ${css(first, ...args)}
    }
  `
