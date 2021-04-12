import type { FC } from 'react'
import React from 'react'

import { ModalContainer, Header, Actions, Action, Body } from './ui'

/* eslint-disable-next-line */
export interface ModalProps {}


export const Modal: FC<ModalProps> = () => {
  return (
    <TwoButtonModal />
  )
}

const TwoButtonModal = () => (
  <ModalContainer>
    <Header icon="check">Update successful</Header>
    <Body>Lorem ipsum ...</Body>
    <Actions>
      <Action onClick={() => null}>Cancel</Action>
      <Action onClick={() => null} primary>
        Activate
      </Action>
    </Actions>
  </ModalContainer>
)

