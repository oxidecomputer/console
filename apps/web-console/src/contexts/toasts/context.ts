import type { ToastProps, ActionToastProps, ConfirmToastProps } from '@oxide/ui'
import { createContext } from 'react'

export interface ToastContextValue {
  addToast: (props: ToastProps) => void
  addActionToast: (props: ActionToastProps) => void
  addConfirmToast: (props: ConfirmToastProps) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
