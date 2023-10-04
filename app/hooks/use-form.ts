/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type FieldValues, type UseFormProps, useForm as _useForm } from 'react-hook-form'

/**
 * Same as built-in `useForm` except `mode: 'onTouched'` is hard-coded and the
 * caller can't set it. `onTouched` means the first validation on a field is
 * triggered by blur, after which it updates with every change.
 *
 * See https://react-hook-form.com/docs/useform#mode
 */
export function useForm<TFieldValues extends FieldValues = FieldValues>(
  props?: Omit<UseFormProps<TFieldValues>, 'mode'>
) {
  return _useForm({ mode: 'onTouched', ...props })
}
