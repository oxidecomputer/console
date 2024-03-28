/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { forwardRef } from 'react'

export const DialogOverlay = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} aria-hidden className="fixed inset-0 z-10 overflow-auto bg-scrim" />
))
