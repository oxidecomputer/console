import type { FC, ReactNode } from 'react'
import React from 'react'
import type { IconName } from '../icon/icons'

import { Action, Actions, Body, Header, Container } from './ui'

interface ModalProps {
  title: string
  icon?: IconName

  children: ReactNode

  onClose: () => void
}

export interface AlertModalProps extends ModalProps {
  confirmText: string

  onConfirm: () => void
}

export const AlertModal: FC<AlertModalProps> = ({
  title,
  icon,
  children,
  confirmText,
  onConfirm,
  // onClose,
}) => (
  <Container widthPercentage={25}>
    <Header icon={icon}>{title}</Header>
    <Body>{children}</Body>
    <Actions>
      <Action primary onClick={onConfirm}>
        {confirmText}
      </Action>
    </Actions>
  </Container>
)

export interface ConfirmModalProps extends ModalProps {
  confirmText: string
  cancelText: string

  onConfirm: () => void
  // NOTE: unsure if this should be separate from `onClose` ... might make sense in _some_ situations
  onCancel: () => void
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
  title,
  icon,
  children,
  confirmText,
  onConfirm,
  cancelText,
  onCancel,
  //onClose,
}) => (
  <Container widthPercentage={(1 / 3) * 100}>
    <Header icon={icon}>{title}</Header>
    <Body>{children}</Body>
    <Actions>
      <Action onClick={onCancel}>{cancelText}</Action>
      <Action primary onClick={onConfirm}>
        {confirmText}
      </Action>
    </Actions>
  </Container>
)
