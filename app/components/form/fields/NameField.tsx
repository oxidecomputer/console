import { capitalize } from '@oxide/util'

import type { TextFieldProps } from './TextField'
import { TextField } from './TextField'

export interface NameFieldProps
  extends Omit<TextFieldProps, 'name' | 'validate' | 'as' | 'rows'> {
  name?: string
}

export function NameField({
  required = true,
  name = 'name',
  label = capitalize(name),
  ...textFieldProps
}: NameFieldProps) {
  return (
    <TextField
      validate={getNameValidator(label, required)}
      required={required}
      label={label}
      name={name}
      {...textFieldProps}
    />
  )
}

// TODO Update JSON schema to match this, add fuzz testing between this and name pattern
export const getNameValidator = (label: string, required: boolean) => (name: string) => {
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
