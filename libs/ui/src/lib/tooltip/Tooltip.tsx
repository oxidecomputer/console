import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

export interface TooltipProps {
  size?: 'sm' | 'lg'
}

const Wrapper = styled.div``

export const Tooltip: FC<TooltipProps> = () => {
  return (
    <Wrapper>
      <h1>Welcome to Tooltip!</h1>
    </Wrapper>
  )
}
