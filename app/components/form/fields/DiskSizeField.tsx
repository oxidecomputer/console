/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { FieldPath, FieldPathByValue, FieldValues } from 'react-hook-form'

import { MAX_DISK_SIZE_GiB } from '@oxide/api'

import { NumberField } from './NumberField'
import type { TextFieldProps } from './TextField'

interface DiskSizeProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends TextFieldProps<TFieldValues, TName> {
  minSize?: number
}

export function DiskSizeField<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, number>,
>({ required = true, name, minSize = 1, ...props }: DiskSizeProps<TFieldValues, TName>) {
  return (
    <NumberField
      units="GiB"
      type="number"
      required={required}
      name={name}
      min={minSize}
      max={MAX_DISK_SIZE_GiB}
      validate={(diskSizeGiB) => {
        if (diskSizeGiB < minSize) {
          return `Must be at least ${minSize} GiB`
        }
        if (diskSizeGiB > MAX_DISK_SIZE_GiB) {
          return `Can be at most ${MAX_DISK_SIZE_GiB} GiB`
        }
      }}
      {...props}
    />
  )
}
