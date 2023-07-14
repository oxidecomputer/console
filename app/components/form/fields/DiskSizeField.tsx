import type { FieldPath, FieldValues } from 'react-hook-form'

import { MAX_DISK_SIZE } from '@oxide/api'

import type { TextFieldProps } from './TextField'
import { TextField } from './TextField'

interface DiskSizeProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends TextFieldProps<TFieldValues, TName> {
  minSize?: number
}

export function DiskSizeField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({ required = true, name, minSize = 1, ...props }: DiskSizeProps<TFieldValues, TName>) {
  return (
    <TextField
      units="GiB"
      type="number"
      required={required}
      name={name}
      min={minSize}
      max={MAX_DISK_SIZE}
      validate={(diskSizeGiB) => {
        if (diskSizeGiB < minSize) {
          return `Must be at least ${minSize} GiB`
        }
        if (diskSizeGiB > MAX_DISK_SIZE) {
          return `Capped at ${MAX_DISK_SIZE / 1000} TiB`
        }
      }}
      {...props}
    />
  )
}
