import type { ActionToastProps, ConfirmToastProps, ToastProps } from '@oxide/ui'

export type Toast = DefaultToast | ActionToast | ConfirmToast

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

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

export type ConfirmToastOptions = Optional<ConfirmToastProps, 'onClose'>
export interface ConfirmToast {
  id: string
  type: 'confirm'
  options: ConfirmToastOptions
}
