import type { TextFieldProps } from './TextField'
import { TextField } from './TextField'
import React from 'react'

export interface NameFieldProps
  extends Omit<TextFieldProps, 'name' | 'validate'> {
  name?: string
}

NameField.initialValue = ''
export function NameField({
  name = 'Name',
  ...textFieldProps
}: NameFieldProps) {
  return <TextField name={name} validate={validateName} {...textFieldProps} />
}

// TODO Update JSON schema to match this, add fuzz testing between this and name pattern
export function validateName(name: string) {
  if (name.length === 0) {
    return 'A name is required'
  } else if (!/^[a-z]/.test(name)) {
    return 'Must start with a lower-case letter'
  } else if (!/[a-z0-9]$/.test(name)) {
    return 'Must end with a letter or number'
  } else if (!/^[a-z0-9-]+$/.test(name)) {
    return 'Can only contain lower-case letters, numbers, and dashes'
  }
}
