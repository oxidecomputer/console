/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { displayBigNum } from '~/util/math'

import { Tooltip } from './Tooltip'

/**
 * Possibly abbreviate number if it's big enough, and if it is, wrap it in a
 * tooltip showing the unabbreviated value.
 */
export function BigNum({ num }: { num: number | bigint }) {
  const [display, abbreviated] = displayBigNum(num)

  if (!abbreviated) return display

  return (
    <Tooltip placement="top" content={num.toLocaleString()}>
      <span>{display}</span>
    </Tooltip>
  )
}
