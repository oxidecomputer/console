/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import { Combobox, type ComboboxBaseProps } from '~/ui/lib/Combobox'
import { capitalize } from '~/util/str'

import { ErrorMessage } from './ErrorMessage'

export type ComboboxFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  name: TName
  control: Control<TFieldValues>
  onChange?: (value: string | null | undefined) => void
  disabled?: boolean
} & ComboboxBaseProps

export function ComboboxField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  // TODO: constrain TValue to extend string
>({
  control,
  name,
  label = capitalize(name),
  required,
  onChange,
  disabled,
  ...props
}: ComboboxFieldProps<TFieldValues, TName>) {
  const { field, fieldState } = useController({ name, control, rules: { required } })
  return (
    <div className="max-w-lg">
      <Combobox
        isDisabled={disabled}
        label={label}
        required={required}
        selected={field.value || null}
        hasError={fieldState.error !== undefined}
        onChange={(value) => {
          field.onChange(value)
          onChange?.(value)
        }}
        {...props}
      />
      <ErrorMessage error={fieldState.error} label={label} />
    </div>
  )
}
