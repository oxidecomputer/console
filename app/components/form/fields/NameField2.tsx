import type { TextFieldProps } from './TextField2'
import { TextField } from './TextField2'

// TODO: making all these things generic seems kind of dubious, but if it works it works
export type NameFieldProps<TFieldValues extends { name: string }> = Omit<
  TextFieldProps<TFieldValues>,
  'name' | 'validate'
>

export function NameField<TFieldValues extends { name: string }>({
  required = true,
  // name = 'name',
  // label = capitalize(name),
  ...textFieldProps
}: NameFieldProps<TFieldValues>) {
  return (
    <TextField
      validate={(name) => validateName(name, required)}
      required={required}
      label="Name"
      name="name"
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
