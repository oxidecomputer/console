/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import fileSize from 'filesize'

import type { Cell } from './Cell'

/** Human-readable format for size in bytes */
export const SizeCell = ({ value: bytes }: Cell<number>) => {
  const size = fileSize(bytes, { base: 2, output: 'object' })
  return (
    <span className="text-secondary">
      {size.value} <span className="text-quaternary">{size.unit}</span>
    </span>
  )
}
