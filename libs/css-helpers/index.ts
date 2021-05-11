import { css } from 'twin.macro'

export * from './breakpoints'
export * from './colors'
export * from './spacing'

/* Hide from sighted users, show to screen readers */
export const visuallyHidden = css`
  position: absolute !important;
  overflow: hidden !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  border: 0 !important;
  clip: rect(1px, 1px, 1px, 1px) !important;
`
