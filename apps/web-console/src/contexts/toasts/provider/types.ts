import type { ActionToastProps, ConfirmToastProps, ToastProps } from '@oxide/ui'

export type Toast = DefaultToast | ActionToast | ConfirmToast

export interface DefaultToast {
  type: 'default'
  props: ToastProps
}

export interface ActionToast {
  type: 'action'
  props: ActionToastProps
}

export interface ConfirmToast {
  type: 'confirm'
  props: ConfirmToastProps
}
