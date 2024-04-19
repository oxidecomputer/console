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

type Toast = {
  id: string
  type: 'toast'
  options: Optional<ToastProps, 'onClose'>
}

type SessionExpired = {
  id: 'session-expired'
  type: 'session-expired'
}

export const useToastStore = create<{ toasts: (Toast | SessionExpired)[] }>(() => ({
  toasts: [],
}))

export function addToast(options: Toast['options']) {
  useToastStore.setState(({ toasts }) => ({
    toasts: [...toasts, { id: uuid(), type: 'toast', options }],
  }))
}
export function removeToast(id: Toast['id']) {
  useToastStore.setState(({ toasts }) => ({ toasts: toasts.filter((t) => t.id !== id) }))
}

export function setSessionExpired() {
  useToastStore.setState(({ toasts }) => {
    // there can only be one, so a second call does nothing
    if (toasts.some((t) => t.type === 'session-expired')) return { toasts }

    return {
      toasts: [...toasts, { id: 'session-expired', type: 'session-expired' }],
    }
  })
}
