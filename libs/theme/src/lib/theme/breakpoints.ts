import { css } from 'styled-components'
import type { Breakpoint, BreakpointHelper } from '../types'

const breakpoints: Record<Breakpoint, number> = {
  xs: 320,
  sm: 640,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

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
 *   ${({ theme }) => theme.breakpoint('sm')`
 *     flex-direction: row;
 *   `}
 * `
 * ```
 * @param breakpoint The breakpoint to use for the media query
 */
export const breakpoint: BreakpointHelper = (breakpoint) => (first, ...args) =>
  css`
    @media (min-width: ${breakpoints[breakpoint]}px) {
      ${css(first, ...args)}
    }
  `
