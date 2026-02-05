/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type {
  FieldPathByValue,
  FieldValues,
  ValidateResult,
} from 'react-hook-form'

import { NumberField } from './NumberField'
import type { TextFieldProps } from './TextField'

interface DiskSizeProps<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, number>,
> extends Omit<TextFieldProps<TFieldValues, TName>, 'min' | 'max' | 'validate'> {
  // replace max and min with our own because original max/min allow string
  min?: number
  /** Undefined means no client-side limit (e.g., for local disks) */
  max: number | undefined
  validate?(diskSizeGiB: number): ValidateResult
}

export function DiskSizeField<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, number>,
>({
  required = true,
  name,
  min = 1,
  max,
  validate,
  ...props
}: DiskSizeProps<TFieldValues, TName>) {
  return (
    <NumberField
      units="GiB"
      required={required}
      name={name}
      min={min}
      max={max}
      validate={(diskSizeGiB) => {
        // Run a number of default validators
        if (Number.isNaN(diskSizeGiB)) {
          return 'Disk size is required'
        }
        if (diskSizeGiB < min) {
          return `Must be at least ${min} GiB`
        }
        if (max !== undefined && diskSizeGiB > max) {
          return `Can be at most ${max} GiB`
        }
        // Run any additional validators passed in from the callsite
        return validate?.(diskSizeGiB)
      }}
      {...props}
    />
  )
}
