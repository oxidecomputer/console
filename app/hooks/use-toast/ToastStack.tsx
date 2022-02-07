import React from 'react'
import type { Toast as ToastModel } from './types'
import { Toast } from '@oxide/ui'
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
        <Toast
          {...options}
          onClose={() => {
            onRemoveToast(id)
            options.onClose?.()
          }}
        />
      </CSSTransition>
    ))}
  </TransitionGroup>
)
