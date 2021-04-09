import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'
import Tippy from '@tippyjs/react'

export interface TooltipProps {
  size?: 'sm' | 'lg'
}

const Wrapper = styled.div``

export const Tooltip: FC<TooltipProps> = () => {
  return (
    <Wrapper>
      <Tippy content="Hello">
        <button>trigger</button>
      </Tippy>
    </Wrapper>
  )
}
