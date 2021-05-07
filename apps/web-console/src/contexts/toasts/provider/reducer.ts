import type { Toast, ToastOptions } from '../types'
import { v4 as uuid } from 'uuid'

// STATE

type ToastState = Toast[]

// ACTIONS

interface AddToastAction {
  type: 'add_toast'
  options: ToastOptions
}

interface RemoveToastAction {
  type: 'remove_toast'
  id: string
}

type Actions = AddToastAction | RemoveToastAction

// HELPERS

const createToast = (options: ToastOptions): Toast => ({
  id: uuid(),
  options,
})

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
    case 'add_toast':
      return appendToast(state, createToast(action.options))

    case 'remove_toast':
      return removeToast(state, action.id)
  }
}

export const initialState: ToastState = []
