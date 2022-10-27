import type { FieldPath, FieldValues } from 'react-hook-form'

import type { TextFieldProps } from './TextField'
import { TextField } from './TextField'

// TODO: Pull this from generated types
const MAX_LEN = 512

export function DescriptionField<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>
>(props: Omit<TextFieldProps<TFieldValues, TFieldName>, 'validate'>) {
  return <TextField validate={validateDescription} {...props} />
}

// TODO Update JSON schema to match this, add fuzz testing between this and name pattern
export function validateDescription(name: string) {
  if (name.length > MAX_LEN) {
    return `A description must be no longer than ${MAX_LEN} characters`
  }
}
