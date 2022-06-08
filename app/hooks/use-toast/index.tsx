import type { FC } from 'react'
import { createContext, useContext, useState } from 'react'
import { v4 as uuid } from 'uuid'

import { ToastStack } from './ToastStack'
import type { Toast } from './types'

type AddToast = (options: Toast['options']) => void

const ToastContext = createContext<AddToast>(() => {})

export const useToast = () => useContext(ToastContext)

export const ToastProvider: FC = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast: AddToast = (options) => {
    setToasts((toasts) => [...toasts, { id: uuid(), options }])
  }

  const removeToast = (id: string) => {
    setToasts((toasts) => toasts.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <ToastStack toasts={toasts} onRemoveToast={removeToast} />
    </ToastContext.Provider>
  )
}
