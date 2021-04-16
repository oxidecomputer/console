import styled, { css } from 'styled-components'

/* Hide from sighted users, show to screen readers */
export const visuallyHiddenCss = css`
  position: absolute !important;
  overflow: hidden !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  border: 0 !important;
  clip: rect(1px, 1px, 1px, 1px) !important;
`

export const VisuallyHidden = styled.span`
  ${visuallyHiddenCss};
`
