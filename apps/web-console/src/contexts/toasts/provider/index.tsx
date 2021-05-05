import type { FC } from 'react'
import React, { useReducer } from 'react'
import type { ToastContextValue } from '../context'
import { ToastContext } from '../context'
import { ToastStack } from './ToastStack'
import { toastReducer, initialState } from './reducer'

export const ToastProvider: FC = ({ children }) => {
  const [{ toasts }, dispatch] = useReducer(toastReducer, initialState)

  const contextValue: ToastContextValue = {
    addToast: (props) => dispatch({ type: 'add_default_toast', props }),
    addActionToast: (props) => dispatch({ type: 'add_action_toast', props }),
    addConfirmToast: (props) => dispatch({ type: 'add_confirm_toast', props }),
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastStack toasts={toasts} />
    </ToastContext.Provider>
  )
}
