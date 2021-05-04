import type { FC } from 'react'
import { useReducer } from 'react'
import React from 'react'
import type { ToastContextValue } from './context'
import { ToastContext } from './context'
import type { ActionToastProps, ConfirmToastProps, ToastProps } from '@oxide/ui'

interface ToastState {
  toasts: Toast[]
}

type Toast = DefaultToast | ActionToast | ConfirmToast

interface DefaultToast {
  type: 'default'
  props: ToastProps
}

interface ActionToast {
  type: 'action'
  props: ActionToastProps
}

interface ConfirmToast {
  type: 'confirm'
  props: ConfirmToastProps
}

interface AddDefaultToastAction {
  type: 'add_default_toast'
  props: ToastProps
}

interface AddActionToastAction {
  type: 'add_action_toast'
  props: ActionToastProps
}

interface AddConfirmToastAction {
  type: 'add_confirm_toast'
  props: ConfirmToastProps
}

type Actions =
  | AddDefaultToastAction
  | AddActionToastAction
  | AddConfirmToastAction

const toastReducer = (state: ToastState, action: Actions): ToastState => {
  switch (action.type) {
    case 'add_default_toast':
      return {
        ...state,
        toasts: [...state.toasts, { type: 'default', props: action.props }],
      }

    case 'add_action_toast':
      return {
        ...state,
        toasts: [...state.toasts, { type: 'action', props: action.props }],
      }

    case 'add_confirm_toast':
      return {
        ...state,
        toasts: [...state.toasts, { type: 'confirm', props: action.props }],
      }
  }
}

const initialState: ToastState = {
  toasts: [],
}

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
      <></>
    </ToastContext.Provider>
  )
}
