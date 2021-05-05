import type { ActionToastProps, ConfirmToastProps, ToastProps } from '@oxide/ui'
import type { Toast } from './types'

interface ToastState {
  toasts: Toast[]
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

export const toastReducer = (
  state: ToastState,
  action: Actions
): ToastState => {
  console.log('reducer fired', state, action)
  console.trace()
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

export const initialState: ToastState = {
  toasts: [],
}
