/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Truncate } from '~/ui/lib/Truncate'

import type { Cell } from './Cell'

export const TruncateCell = ({
  value,
  maxLength = 32,
}: Cell<string> & {
  maxLength?: number
}) => (
  <span className="text-secondary">
    <Truncate text={value} maxLength={maxLength} />
  </span>
)
