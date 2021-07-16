import type { ToastProps } from '@oxide/ui'

export interface Toast {
  id: string
  options: Optional<ToastProps, 'onClose'>
}
