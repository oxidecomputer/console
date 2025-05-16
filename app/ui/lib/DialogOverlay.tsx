/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import * as m from 'motion/react-m'
import { type Ref } from 'react'

type Props = {
  ref?: Ref<HTMLDivElement>
}

export const DialogOverlay = ({ ref }: Props) => (
  <m.div
    ref={ref}
    aria-hidden
    className="bg-scrim fixed inset-0 z-(--modal-overlay) overflow-auto"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15, ease: 'easeOut' }}
  />
)
