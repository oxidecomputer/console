/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { FieldPath, FieldValues } from 'react-hook-form'

import { TextField, type TextFieldProps } from './TextField'

export function OxqlField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: Omit<TextFieldProps<TFieldValues, TName>, 'validate'>) {
  return <TextField as="textarea" validate={validateDescription} {...props} />
}

export function validateDescription(_name: string) {
  return true
}
