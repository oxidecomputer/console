/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { IpVersion } from '@oxide/api'

import { parseIpNet } from '~/util/ip'

export type MemberAddForm = {
  subnet: string
  minPrefixLength: number
  maxPrefixLength: number
}

type ValidationErrors = Partial<Record<keyof MemberAddForm, string>>

/**
 * This function is a sneaky way to back into cross-field validation while only
 * hooking into the field-level `validate` callback. This function looks at all
 * the form `values` together and sets errors for each field in the form, and
 * then the callsites look like this: they all call it the same way and just
 * pluck their own error off the result.
 *
 * ```ts
 * validate={(_maxPrefixLength, values) =>
 *   validateMember(poolData.ipVersion, values).maxPrefixLength
 * }
 * ```
 */
export function validateMember(
  poolVersion: IpVersion,
  values: MemberAddForm
): ValidationErrors {
  const maxBound = poolVersion === 'v4' ? 32 : 128
  const parsed = parseIpNet(values.subnet)
  const { minPrefixLength: minPL, maxPrefixLength: maxPL } = values
  const subnetWidth = parsed.type !== 'error' ? parsed.width : undefined
  const inRange = (v: number) => !Number.isNaN(v) && v >= 0 && v <= maxBound

  const errors: ValidationErrors = {}

  if (parsed.type === 'error') {
    errors.subnet = parsed.message
  } else if (parsed.type !== poolVersion) {
    errors.subnet = `IP${parsed.type} subnet not allowed in IP${poolVersion} pool`
  }

  // min and max prefix length are optional, and NaN is the value they have
  // when they're unset (matching NumberField)

  // min prefix: bounds → ordering → subnet width
  if (!Number.isNaN(minPL) && !inRange(minPL)) {
    errors.minPrefixLength = `Must be between 0 and ${maxBound}`
  } else if (inRange(minPL) && inRange(maxPL) && minPL > maxPL) {
    errors.minPrefixLength = 'Min prefix length must be ≤ max prefix length'
  } else if (inRange(minPL) && subnetWidth !== undefined && minPL < subnetWidth) {
    errors.minPrefixLength = `Must be ≥ subnet prefix length (${subnetWidth})`
  }

  // max prefix: bounds → subnet width
  if (!Number.isNaN(maxPL) && !inRange(maxPL)) {
    errors.maxPrefixLength = `Must be between 0 and ${maxBound}`
  } else if (inRange(maxPL) && subnetWidth !== undefined && maxPL < subnetWidth) {
    errors.maxPrefixLength = `Must be ≥ subnet prefix length (${subnetWidth})`
  }

  return errors
}
