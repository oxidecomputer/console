/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ReactNode } from 'react'

import { formatBytes } from '~/util/units'

/**
 * A value with a dimmed unit label, e.g. `4 vCPU` or `16 GiB`: the value renders
 * in the default text color, the unit in tertiary, separated by a single space.
 */
export function ValueUnit({ value, unit }: { value: ReactNode; unit: ReactNode }) {
  return (
    <span className="text-default">
      {value} <span className="text-tertiary">{unit}</span>
    </span>
  )
}

/** Format a byte count with `formatBytes` and render it as a {@link ValueUnit}. */
export function Size({ bytes }: { bytes: number }) {
  const { value, unit } = formatBytes(bytes)
  return <ValueUnit value={value} unit={unit} />
}
