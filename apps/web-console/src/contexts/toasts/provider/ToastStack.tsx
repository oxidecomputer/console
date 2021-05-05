import type { FC } from 'react'
import React from 'react'
import type { Toast as ToastModel } from './types'
import styled from 'styled-components'
import { Toast } from '@oxide/ui'
import { spacing } from '@oxide/css-helpers'

const Container = styled.div`
  position: fixed;
  z-index: 9999;

  bottom: ${spacing(4)};
  right: ${spacing(4)};

  display: flex;
  flex-direction: column;
`

interface ToastStackProps {
  toasts: ToastModel[]
}

export const ToastStack: FC<ToastStackProps> = ({ toasts }) => (
  <Container tw="space-between-x-2">
    {toasts.map((toast) => {
      switch (toast.type) {
        case 'default':
          return <Toast {...toast.props} />
      }
    })}
  </Container>
)
