import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

/* eslint-disable-next-line */
export interface ToastProps {}

const Wrapper = styled.div``

export const Toast: FC<ToastProps> = () => {
  return (
    <Wrapper>
      <h1>Welcome to Toast!</h1>
    </Wrapper>
  )
}
