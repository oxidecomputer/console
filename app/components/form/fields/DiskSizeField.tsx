import type { FieldPath, FieldValues } from 'react-hook-form'

import type { TextFieldProps } from './TextField'
import { TextField } from './TextField'

interface DiskSizeProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends Omit<TextFieldProps<TFieldValues, TName>, 'validate'> {
  minSize?: number
  imageSize: number | null
}

export function DiskSizeField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  required = true,
  name,
  minSize = 1,
  imageSize,
  ...props
}: DiskSizeProps<TFieldValues, TName>) {
  const validateImageSize = imageSize
    ? {
        validate: (v: number) =>
          v > imageSize || `Boot disk needs to be larger than the image (${imageSize} GiB)`,
      }
    : {}

  return (
    <TextField
      units="GiB"
      type="number"
      required={required}
      name={name}
      min={minSize}
      {...props}
      {...validateImageSize}
    />
  )
}
