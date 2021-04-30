import { css } from 'styled-components'
import type { SizingMultiplier } from './base'
import { spacing } from './base'

export const marginX = (size: SizingMultiplier) => css`
  margin-left: ${spacing(size)};
  margin-right: ${spacing(size)};
`

export const marginY = (size: SizingMultiplier) => css`
  margin-top: ${spacing(size)};
  margin-bottom: ${spacing(size)};
`
