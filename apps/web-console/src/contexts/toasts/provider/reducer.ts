import type { ActionToastProps, ConfirmToastProps, ToastProps } from '@oxide/ui'
import type { Toast } from './types'
import { v4 as uuid } from 'uuid'

// STATE

type ToastState = Toast[]

// ACTIONS

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

const createToast = (type: Toast['type'], props: Toast['props']): Toast => {
  switch (type) {
    case 'default':
      return { id: uuid(), type, props: props as ToastProps }

    case 'action':
      return { id: uuid(), type, props: props as ActionToastProps }

    case 'confirm':
      return { id: uuid(), type, props: props as ConfirmToastProps }
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
      return appendToast(state, createToast('default', action.props))

    case 'add_action_toast':
      return appendToast(state, createToast('action', action.props))

    case 'add_confirm_toast':
      return appendToast(state, createToast('confirm', action.props))

    case 'remove_toast':
      return removeToast(state, action.id)
  }
}

export const initialState: ToastState = []
