/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'

import { removeToast, useToastStore } from '~/stores/toast'
import { Toast } from '~/ui/lib/Toast'

export function ToastStack() {
  const toasts = useToastStore((state) => state.toasts)

  return (
    <div
      className="pointer-events-auto fixed bottom-4 left-4 z-(--z-toast) flex flex-col items-end"
      data-testid="Toasts"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          // outer box collapses/expands so neighbouring toasts glide instead of jumping
          <m.div
            key={toast.id}
            className="pt-2"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          >
            <m.div
              initial={{ opacity: 0, transform: 'translateY(20px) scale(0.95)' }}
              animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
              exit={{ opacity: 0, transform: 'translateY(20px) scale(0.95)' }}
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
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
