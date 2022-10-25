import type { Path } from 'react-hook-form'

import type { TextFieldProps } from './TextField'
import { TextField } from './TextField'

// TODO: Pull this from generated types
const MAX_LEN = 512

export type DescriptionFieldProps<TFieldValues extends { description: string }> = Omit<
  TextFieldProps<TFieldValues>,
  'name' | 'validate'
>

export function DescriptionField<TFieldValues extends { description: string }>({
  ...textFieldProps
}: DescriptionFieldProps<TFieldValues>) {
  return (
    <TextField
      // TODO: I don't get why we have to cast. It should know `description` is
      // valid because we require that TFieldValues has that key
      name={'description' as Path<TFieldValues>}
      validate={validateDescription}
      {...textFieldProps}
    />
  )
}

// TODO Update JSON schema to match this, add fuzz testing between this and name pattern
export function validateDescription(name: string) {
  if (name.length > MAX_LEN) {
    return `A description must be no longer than ${MAX_LEN} characters`
  }
}
