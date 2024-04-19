/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { v4 as uuid } from 'uuid'
import { create } from 'zustand'

import type { ToastProps } from '~/ui/lib/Toast'

type ToastOptions = Optional<ToastProps, 'onClose'>

type Toast =
  | { type: 'toast'; id: string; options: ToastOptions }
  | { type: 'session-expired'; id: 'session-expired' }

export const useToastStore = create<{ toasts: Toast[] }>(() => ({
  toasts: [],
}))

/** Add a regular toast */
export function addToast(options: ToastOptions) {
  useToastStore.setState(({ toasts }) => ({
    toasts: [...toasts, { id: uuid(), type: 'toast', options }],
  }))
}
export function removeToast(id: Toast['id']) {
  useToastStore.setState(({ toasts }) => ({ toasts: toasts.filter((t) => t.id !== id) }))
}

const sessionExpired: Toast = { id: 'session-expired', type: 'session-expired' }

/** Add a session expired toast, which can't be closed */
export function setSessionExpired() {
  const { toasts } = useToastStore.getState()
  // there can only be one, so a second call does nothing
  if (toasts.some((t) => t.type === 'session-expired')) return

  useToastStore.setState(({ toasts }) => ({ toasts: [...toasts, sessionExpired] }))
}
