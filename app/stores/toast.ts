import { v4 as uuid } from 'uuid'
import { create } from 'zustand'

import type { ToastProps } from '@oxide/ui'

type Toast = {
  id: string
  options: Optional<ToastProps, 'onClose'>
}

type ToastStore = {
  toasts: Toast[]
  add: (options: Toast['options']) => void
  remove: (id: Toast['id']) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (options) => set(({ toasts }) => ({ toasts: [...toasts, { id: uuid(), options }] })),
  remove: (id) => set(({ toasts }) => ({ toasts: toasts.filter((t) => t.id !== id) })),
}))

// TODO: take add and remove out of the store once everthing is converted to this addToast

export function addToast(options: Toast['options']) {
  useToastStore.getState().add(options)
}
