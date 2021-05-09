import React from 'react'
import type { Toast as ToastModel } from './types'
import { Global } from '@emotion/react'
import { ActionToast, ConfirmToast, Toast } from '@oxide/ui'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { css } from 'twin.macro'

const toastAnimations = css`
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

export const ToastAnimations = () => <Global styles={toastAnimations} />

interface ToastStackProps {
  toasts: ToastModel[]
  onRemoveToast: (id: string) => void
}

export const ToastStack = ({ toasts, onRemoveToast }: ToastStackProps) => (
  <TransitionGroup tw="fixed z-50 bottom-4 right-4 space-y-2 flex flex-col items-end">
    {toasts.map(({ id, options }: ToastModel) => (
      <CSSTransition key={id} timeout={600} classNames="toast">
        {options.type === 'default' ? (
          <Toast
            {...options}
            onClose={() => {
              onRemoveToast(id)
              options.onClose?.()
            }}
          />
        ) : options.type === 'action' ? (
          <ActionToast
            {...options}
            onAction={() => {
              onRemoveToast(id)
              options.onAction()
            }}
            onClose={() => {
              onRemoveToast(id)
              options.onClose?.()
            }}
          />
        ) : options.type === 'confirm' ? (
          <ConfirmToast
            {...options}
            onConfirm={() => {
              onRemoveToast(id)
              options.onConfirm()
            }}
            onCancel={() => {
              onRemoveToast(id)
              options.onCancel()
            }}
            onClose={() => {
              onRemoveToast(id)
            }}
          />
        ) : null}
      </CSSTransition>
    ))}
  </TransitionGroup>
)
