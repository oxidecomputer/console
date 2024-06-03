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

import { Combobox } from '~/ui/lib/Combobox'
import { capitalize } from '~/util/str'

type ComboboxItem = { label: string; value: string }

export type ComboboxFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  name: TName
  placeholder?: string
  className?: string
  label?: string
  required?: boolean
  description?: string | React.ReactNode
  tooltipText?: string
  control: Control<TFieldValues>
  disabled?: boolean
  items: ComboboxItem[]
  onChange?: (value: string | null | undefined) => void
  isLoading?: boolean
  isDisabled?: boolean
}

export function ComboboxField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  description,
  items,
  control,
  name,
  label = capitalize(name),
  required,
  isLoading = false,
  isDisabled,
  onChange,
}: ComboboxFieldProps<TFieldValues, TName>) {
  const { field, fieldState } = useController({ name, control, rules: { required } })
  return (
    <div>
      <Combobox
        items={items}
        description={description}
        label={label}
        required={required}
        selected={field.value || null}
        hasError={fieldState.error !== undefined}
        isLoading={isLoading}
        isDisabled={isDisabled}
        onChange={(value) => {
          field.onChange(value)
          onChange?.(value)
        }}
      />
    </div>
  )
}
