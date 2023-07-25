/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { FieldPath, FieldValues } from 'react-hook-form'

import { capitalize } from '@oxide/util'

import type { TextFieldProps } from './TextField'
import { TextField } from './TextField'

export function NameField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  required = true,
  name,
  label = capitalize(name),
  ...textFieldProps
}: Omit<TextFieldProps<TFieldValues, TName>, 'validate'> & { label?: string }) {
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

  if (name.length > 63) {
    return 'Must be 63 characters or fewer'
  }

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
