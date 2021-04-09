import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

/* eslint-disable-next-line */
export interface TooltipProps {}

const Wrapper = styled.div``

export const Tooltip: FC<TooltipProps> = () => {
  return (
    <Wrapper>
      <h1>Welcome to Tooltip!</h1>
    </Wrapper>
  )
}
