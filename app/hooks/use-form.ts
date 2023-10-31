/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm as _useForm, type FieldValues, type UseFormProps } from 'react-hook-form'

/**
 * Same as built-in `useForm` except we can hard-code some props and prevent the
 * caller from setting them.
 * See https://react-hook-form.com/docs/useform#mode
 */
export function useForm<TFieldValues extends FieldValues = FieldValues>(
  props?: Omit<UseFormProps<TFieldValues>, 'mode'>
) {
  return _useForm({ mode: 'onSubmit', ...props })
}
