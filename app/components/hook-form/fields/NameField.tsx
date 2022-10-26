import type { FieldValues } from 'react-hook-form'

import { capitalize } from '@oxide/util'

import type { TextFieldProps } from './TextField'
import { TextField } from './TextField'

// TODO: making all these things generic seems kind of dubious, but if it works it works
export type NameFieldProps<TFieldValues extends FieldValues> = Omit<
  TextFieldProps<TFieldValues>,
  'validate'
> & {
  label?: string
}

export function NameField<TFieldValues extends FieldValues>({
  required = true,
  name,
  label = capitalize(name),
  ...textFieldProps
}: NameFieldProps<TFieldValues>) {
  return (
    <TextField
      validate={(name) => validateName(name, label, required)}
      required={required}
      label={label}
      name={name}
      {...textFieldProps}
    />
  )
}

// TODO Update JSON schema to match this, add fuzz testing between this and name pattern
export const validateName = (name: string, label: string, required: boolean) => {
  if (!required && !name) return

  if (name.length === 0) {
    return `${label} is required`
  } else if (!/^[a-z]/.test(name)) {
    return 'Must start with a lower-case letter'
  } else if (!/[a-z0-9]$/.test(name)) {
    return 'Must end with a letter or number'
  } else if (!/^[a-z0-9-]+$/.test(name)) {
    return 'Can only contain lower-case letters, numbers, and dashes'
  }
}
