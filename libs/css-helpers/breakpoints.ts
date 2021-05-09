import type { CSSInterpolation } from '@emotion/serialize'
import { css } from 'twin.macro'

export type Breakpoint = 'xs' | 'sm' | 'lg' | 'xl' | '2xl'
export const breakpoints: Record<Breakpoint, number> = {
  xs: 320,
  sm: 640,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

/**
 * This helper works simlarly to the `css`, but it takes a breakpoint and only
 * applies the styles for that given breakpoint.
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
export const breakpoint =
  (breakpoint: Breakpoint) =>
  (first: TemplateStringsArray, ...args: CSSInterpolation[]) =>
    css`
      @media (min-width: ${breakpoints[breakpoint]}px) {
        ${css(first, ...args)}
      }
    `
