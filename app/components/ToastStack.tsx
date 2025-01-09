/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { AnimatePresence, m } from 'motion/react'

import { removeToast, useToastStore } from '~/stores/toast'
import { Toast } from '~/ui/lib/Toast'

export function ToastStack() {
  const toasts = useToastStore((state) => state.toasts)

  return (
    <div
      className="pointer-events-auto fixed bottom-4 left-4 z-toast flex flex-col items-end space-y-2"
      data-testid="Toasts"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <m.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
          >
            <Toast
              {...toast.options}
              onClose={() => {
                removeToast(toast.id)
                toast.options.onClose?.()
              }}
            />
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
