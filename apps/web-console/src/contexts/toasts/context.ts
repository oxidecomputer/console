import { createContext } from 'react'
import type {
  ActionToastOptions,
  ConfirmToastOptions,
  DefaultToastOptions,
} from './types'

export interface ToastContextValue {
  addToast: (options: DefaultToastOptions) => void
  addActionToast: (options: ActionToastOptions) => void
  addConfirmToast: (options: ConfirmToastOptions) => void
}

export const ToastContext = createContext<ToastContextValue>({
  /* eslint-disable @typescript-eslint/no-empty-function */
  addToast: () => {},
  addActionToast: () => {},
  addConfirmToast: () => {},
  /* eslint-enable @typescript-eslint/no-empty-function */
})
