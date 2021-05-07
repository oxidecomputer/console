import type { ActionToastProps, ConfirmToastProps, ToastProps } from '@oxide/ui'

export type ToastOptions = DefaultOptions | ActionOptions | ConfirmOptions

export type DefaultOptions = { type: 'default' } & Optional<
  ToastProps,
  'onClose'
>
export type ActionOptions = { type: 'action' } & Optional<
  ActionToastProps,
  'onClose'
>
export type ConfirmOptions = { type: 'confirm' } & Omit<
  ConfirmToastProps,
  'onClose'
>

export interface Toast {
  id: string
  options: ToastOptions
}
