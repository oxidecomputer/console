import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

/* eslint-disable-next-line */
export interface TooltipProps {}

const StyledTooltip = styled.div`
  color: pink;
`

export const Tooltip: FC<TooltipProps> = (props) => {
  return (
    <StyledTooltip>
      <h1>Welcome to Tooltip!</h1>
    </StyledTooltip>
  )
}
