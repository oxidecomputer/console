import type { FC } from 'react'
import React from 'react'
import type { Toast as ToastModel } from '../types'
import styled, { createGlobalStyle } from 'styled-components'
import { ActionToast, ConfirmToast, Toast } from '@oxide/ui'
import { spacing } from '@oxide/css-helpers'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

const Container = styled(TransitionGroup)`
  position: fixed;
  z-index: 9999;

  bottom: ${spacing(4)};
  right: ${spacing(4)};

  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

export const ToastAnimations = createGlobalStyle`
  .toast-enter {
    transform: translateY(100%);
    opacity: 0;
  }

  .toast-enter-active {
    transform: none;
    opacity: 1;
    transition: transform 600ms ease-in-out, opacity 600ms ease-in-out;
  }

  .toast-exit {
    transform: none;
    opacity: 1;
  }

  .toast-exit-active {
    transform: translateX(100%);
    opacity: 0;
    transition: transform 600ms ease-in-out, opacity 600ms ease-in-out;
  }
`

interface ToastStackProps {
  toasts: ToastModel[]

  onRemoveToast: (id: string) => void
}

export const ToastStack: FC<ToastStackProps> = ({ toasts, onRemoveToast }) => (
  <Container tw="space-between-x-2">
    {toasts.map((toast) => (
      <CSSTransition key={toast.id} timeout={600} classNames="toast">
        {() => {
          switch (toast.type) {
            case 'default':
              return (
                <Toast
                  {...toast.options}
                  onClose={() => {
                    onRemoveToast(toast.id)
                    toast.options.onClose && toast.options.onClose()
                  }}
                />
              )

            case 'action':
              return (
                <ActionToast
                  {...toast.options}
                  onAction={() => {
                    onRemoveToast(toast.id)
                    toast.options.onAction()
                  }}
                  onClose={() => {
                    onRemoveToast(toast.id)
                    toast.options.onClose && toast.options.onClose()
                  }}
                />
              )

            case 'confirm':
              return (
                <ConfirmToast
                  {...toast.options}
                  onConfirm={() => {
                    onRemoveToast(toast.id)
                    toast.options.onConfirm()
                  }}
                  onCancel={() => {
                    onRemoveToast(toast.id)
                    toast.options.onCancel()
                  }}
                  onClose={() => {
                    onRemoveToast(toast.id)
                  }}
                />
              )
          }
        }}
      </CSSTransition>
    ))}
  </Container>
)
