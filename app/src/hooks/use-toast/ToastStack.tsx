import React from 'react'
import type { Toast as ToastModel } from './types'
import { ActionToast, ConfirmToast, Toast } from '@oxide/ui'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import './toast-anim.css'

interface ToastStackProps {
  toasts: ToastModel[]
  onRemoveToast: (id: string) => void
}

export const ToastStack = ({ toasts, onRemoveToast }: ToastStackProps) => (
  <TransitionGroup className="fixed z-50 bottom-4 right-4 space-y-2 flex flex-col items-end">
    {toasts.map(({ id, options }: ToastModel) => (
      <CSSTransition key={id} timeout={300} classNames="toast">
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
