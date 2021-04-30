import { css } from 'styled-components'
import type { SizingMultiplier } from './base'
import { spacing } from './base'

export const paddingX = (size: SizingMultiplier) => css`
  padding-left: ${spacing(size)};
  padding-right: ${spacing(size)};
`

export const paddingY = (size: SizingMultiplier) => css`
  padding-top: ${spacing(size)};
  padding-bottom: ${spacing(size)};
`
