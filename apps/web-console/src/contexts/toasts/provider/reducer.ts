import type {
  ActionToastOptions,
  ConfirmToastOptions,
  DefaultToastOptions,
  Toast,
} from '../types'
import { v4 as uuid } from 'uuid'

// STATE

type ToastState = Toast[]

// ACTIONS

interface AddDefaultToastAction {
  type: 'add_default_toast'
  options: DefaultToastOptions
}

interface AddActionToastAction {
  type: 'add_action_toast'
  options: ActionToastOptions
}

interface AddConfirmToastAction {
  type: 'add_confirm_toast'
  options: ConfirmToastOptions
}

interface RemoveToastAction {
  type: 'remove_toast'
  id: string
}

type Actions =
  | AddDefaultToastAction
  | AddActionToastAction
  | AddConfirmToastAction
  | RemoveToastAction

// HELPERS

const createToast = (
  action: AddDefaultToastAction | AddActionToastAction | AddConfirmToastAction
): Toast => {
  switch (action.type) {
    case 'add_default_toast':
      return { id: uuid(), type: 'default', options: action.options }

    case 'add_action_toast':
      return { id: uuid(), type: 'action', options: action.options }

    case 'add_confirm_toast':
      return { id: uuid(), type: 'confirm', options: action.options }
  }
}

const appendToast = (toastState: ToastState, toast: Toast): ToastState => [
  ...toastState,
  toast,
]

const removeToast = (toastState: ToastState, id: string): ToastState =>
  toastState.filter((toast) => toast.id !== id)

// REDUCER

export const toastReducer = (
  state: ToastState,
  action: Actions
): ToastState => {
  switch (action.type) {
    case 'add_default_toast':
    case 'add_action_toast':
    case 'add_confirm_toast':
      return appendToast(state, createToast(action))

    case 'remove_toast':
      return removeToast(state, action.id)
  }
}

export const initialState: ToastState = []
