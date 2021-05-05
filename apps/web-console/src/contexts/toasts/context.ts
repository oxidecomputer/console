import type { ToastProps, ActionToastProps, ConfirmToastProps } from '@oxide/ui'
import { createContext } from 'react'

export interface ToastContextValue {
  addToast: (props: ToastProps) => void
  addActionToast: (props: ActionToastProps) => void
  addConfirmToast: (props: ConfirmToastProps) => void
}

/* eslint-disable @typescript-eslint/no-empty-function */
export const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
  addActionToast: () => {},
  addConfirmToast: () => {},
})
/* eslint-enable @typescript-eslint/no-empty-function */
