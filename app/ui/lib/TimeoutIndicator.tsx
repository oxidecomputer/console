/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useTimeout } from './use-timeout'

export interface TimeoutIndicatorProps {
  timeout: number
  onTimeoutEnd: () => void
}

export const TimeoutIndicator = ({ timeout, onTimeoutEnd }: TimeoutIndicatorProps) => {
  useTimeout(onTimeoutEnd, timeout)

  return null
}
