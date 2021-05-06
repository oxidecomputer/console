import type { ActionToastProps, ConfirmToastProps, ToastProps } from '@oxide/ui'

export type Toast = DefaultToast | ActionToast | ConfirmToast

export type DefaultToastOptions = Optional<ToastProps, 'onClose'>
export interface DefaultToast {
  id: string
  type: 'default'
  options: DefaultToastOptions
}

export type ActionToastOptions = Optional<ActionToastProps, 'onClose'>
export interface ActionToast {
  id: string
  type: 'action'
  options: ActionToastOptions
}

export type ConfirmToastOptions = Omit<ConfirmToastProps, 'onClose'>
export interface ConfirmToast {
  id: string
  type: 'confirm'
  options: ConfirmToastOptions
}
