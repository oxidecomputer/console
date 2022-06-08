import { CSSTransition, TransitionGroup } from 'react-transition-group'

import { Toast } from '@oxide/ui'

import './toast-anim.css'
import type { Toast as ToastModel } from './types'

interface ToastStackProps {
  toasts: ToastModel[]
  onRemoveToast: (id: string) => void
}

export const ToastStack = ({ toasts, onRemoveToast }: ToastStackProps) => (
  <TransitionGroup className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
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
