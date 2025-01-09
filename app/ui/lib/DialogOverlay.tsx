/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { m } from 'motion/react'
import { forwardRef } from 'react'

export const DialogOverlay = forwardRef<HTMLDivElement>((_, ref) => (
  <m.div
    ref={ref}
    aria-hidden
    className="fixed inset-0 z-modalOverlay overflow-auto bg-scrim"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15, ease: 'easeOut' }}
  />
))
