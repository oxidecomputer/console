import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

/* eslint-disable-next-line */
export interface ModalProps {}

const Wrapper = styled.div``

export const Modal: FC<ModalProps> = () => {
  return (
    <Wrapper>
      <h1>Welcome to Modal!</h1>
    </Wrapper>
  )
}
