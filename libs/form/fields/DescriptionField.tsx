import type { TextFieldProps } from './TextField'
import { TextField } from './TextField'
import React from 'react'

// TODO: Pull this from generated types
const MAX_LEN = 512

export interface DescriptionFieldProps
  extends Omit<TextFieldProps, 'name' | 'validate'> {
  name?: string
}

export function DescriptionField({
  name = 'description',
  ...textFieldProps
}: DescriptionFieldProps) {
  return (
    <TextField name={name} validate={validateDescription} {...textFieldProps} />
  )
}

// TODO Update JSON schema to match this, add fuzz testing between this and name pattern
export function validateDescription(name: string) {
  if (name.length > MAX_LEN) {
    return `A description must be no longer than ${MAX_LEN} characters`
  }
}
