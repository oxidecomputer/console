import { createContext } from 'react'
import type { ToastOptions } from './types'

export interface ToastContextValue {
  addToast: (options: ToastOptions) => void
}

export const ToastContext = createContext<ToastContextValue>({
  /* eslint-disable @typescript-eslint/no-empty-function */
  addToast: () => {},
  /* eslint-enable @typescript-eslint/no-empty-function */
})
