import type { ActionToastProps, ConfirmToastProps, ToastProps } from '@oxide/ui'

type DefaultOptions = { type: 'default' } & Optional<ToastProps, 'onClose'>
type ActionOptions = { type: 'action' } & Optional<ActionToastProps, 'onClose'>
type ConfirmOptions = { type: 'confirm' } & Omit<ConfirmToastProps, 'onClose'>

export interface Toast {
  id: string
  options: DefaultOptions | ActionOptions | ConfirmOptions
}
