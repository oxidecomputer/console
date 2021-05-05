import type { ActionToastProps, ConfirmToastProps, ToastProps } from '@oxide/ui'

export type Toast = DefaultToast | ActionToast | ConfirmToast

export interface DefaultToast {
  id: string
  type: 'default'
  props: ToastProps
}

export interface ActionToast {
  id: string
  type: 'action'
  props: Omit<ActionToastProps, 'onClose'>
}

export interface ConfirmToast {
  id: string
  type: 'confirm'
  props: ConfirmToastProps
}
