import type { FC } from 'react'
import React, { useReducer } from 'react'
import type { ToastContextValue } from '../context'
import { ToastContext } from '../context'
import { ToastStack, ToastAnimations } from './ToastStack'
import { toastReducer, initialState } from './reducer'

export const ToastProvider: FC = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, initialState)

  const contextValue: ToastContextValue = {
    addToast: (options) => dispatch({ type: 'add_toast', options }),
  }

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastAnimations />
      {children}
      <ToastStack
        toasts={toasts}
        onRemoveToast={(id) => dispatch({ type: 'remove_toast', id })}
      />
    </ToastContext.Provider>
  )
}
