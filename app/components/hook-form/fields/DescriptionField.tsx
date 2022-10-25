import type { FieldValues } from 'react-hook-form'

import type { TextFieldProps } from './TextField'
import { TextField } from './TextField'

// TODO: Pull this from generated types
const MAX_LEN = 512

export type DescriptionFieldProps<TFieldValues extends FieldValues> = Omit<
  TextFieldProps<TFieldValues>,
  'validate'
>
export function DescriptionField<TFieldValues extends FieldValues>(
  props: DescriptionFieldProps<TFieldValues>
) {
  return <TextField validate={validateDescription} {...props} />
}

// TODO Update JSON schema to match this, add fuzz testing between this and name pattern
export function validateDescription(name: string) {
  if (name.length > MAX_LEN) {
    return `A description must be no longer than ${MAX_LEN} characters`
  }
}
