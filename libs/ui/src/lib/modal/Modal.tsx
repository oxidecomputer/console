import type { FC } from 'react'
import React from 'react'

import { ModalContainer, Header, Actions, Action, Body } from './ui'

export interface ModalProps {
  /**
   * Fired when the modal should be closed
   */
  onClose: () => void
}

export const Modal: FC<ModalProps> = ({ onClose }) => {
  return (
    <ModalContainer>
      <Header icon="check">Update successful</Header>
      <Body>Lorem ipsum ...</Body>
      <Actions>
        <Action onClick={() => onClose()}>Cancel</Action>
        <Action onClick={() => null} primary>
          Activate
        </Action>
      </Actions>
    </ModalContainer>
  )
}
