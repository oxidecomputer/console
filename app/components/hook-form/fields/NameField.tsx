import type { Path } from 'react-hook-form'

import type { TextFieldProps } from './TextField'
import { TextField } from './TextField'

// TODO: making all these things generic seems kind of dubious, but if it works it works
export type NameFieldProps<TFieldValues extends { name: string }> = Omit<
  TextFieldProps<TFieldValues>,
  'name' | 'validate'
>

export function NameField<TFieldValues extends { name: string }>({
  required = true,
  // TODO: should name be hardcoded? it's hard to both be flexible and have
  // `name` as a default. it's kind of one or the other: we leave it generic and
  // we always have to pass it, or we hard code it
  // name = 'name',
  // label = capitalize(name),
  ...textFieldProps
}: NameFieldProps<TFieldValues>) {
  return (
    <TextField
      validate={(name) => validateName(name, required)}
      required={required}
      label="Name"
      // TODO: I don't get why we have to cast. It should know `name` is
      // valid because we require that TFieldValues has that key
      name={'name' as Path<TFieldValues>}
      {...textFieldProps}
    />
  )
}

// TODO Update JSON schema to match this, add fuzz testing between this and name pattern
export const validateName = (name: string, required: boolean) => {
  if (!required && !name) return

  if (name.length === 0) {
    return `Name is required`
  } else if (!/^[a-z]/.test(name)) {
    return 'Must start with a lower-case letter'
  } else if (!/[a-z0-9]$/.test(name)) {
    return 'Must end with a letter or number'
  } else if (!/^[a-z0-9-]+$/.test(name)) {
    return 'Can only contain lower-case letters, numbers, and dashes'
  }
}
