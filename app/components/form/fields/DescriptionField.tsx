/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { FieldPath, FieldValues } from 'react-hook-form'

import { TextField, type TextFieldProps } from './TextField'

// TODO: Pull this from generated types
const MAX_LEN = 512

export function DescriptionField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: Omit<TextFieldProps<string, TFieldValues, TName>, 'validate'>) {
  return <TextField as="textarea" validate={validateDescription} {...props} />
}

// TODO Update JSON schema to match this, add fuzz testing between this and name pattern
export function validateDescription(name: string) {
  if (name.length > MAX_LEN) {
    return `A description must be no longer than ${MAX_LEN} characters`
  }
}
