/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type ReactElement } from 'react'
import { v4 as uuid } from 'uuid'
import { create } from 'zustand'

import type { ToastProps } from '~/ui/lib/Toast'

type Toast = {
  id: string
  options: Optional<ToastProps, 'onClose'>
}

export const useToastStore = create<{ toasts: Toast[] }>(() => ({ toasts: [] }))

/**
 * If argument is `ReactElement | string`, use it directly as `{ content }`.
 * Otherwise it's a config object.
 */
export function addToast(optionsOrContent: Toast['options'] | ReactElement | string) {
  const options =
    typeof optionsOrContent === 'object' && 'content' in optionsOrContent
      ? optionsOrContent
      : { content: optionsOrContent }
  useToastStore.setState(({ toasts }) => ({ toasts: [...toasts, { id: uuid(), options }] }))
}

export function removeToast(id: Toast['id']) {
  useToastStore.setState(({ toasts }) => ({ toasts: toasts.filter((t) => t.id !== id) }))
}
