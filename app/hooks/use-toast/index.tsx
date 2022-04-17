import type { ReactNode } from 'react'
import React, { useState, createContext, useContext } from 'react'
import { v4 as uuid } from 'uuid'

import type { Toast } from './types'
import { ToastStack } from './ToastStack'

type AddToast = (options: Toast['options']) => void

const ToastContext = createContext<AddToast>(() => {})

export const useToast = () => useContext(ToastContext)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
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
