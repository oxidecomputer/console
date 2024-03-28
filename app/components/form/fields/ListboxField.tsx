/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import { Listbox, type ListboxItem } from '~/ui/lib/Listbox'
import { capitalize } from '~/util/str'

import { ErrorMessage } from './ErrorMessage'

export type ListboxFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  name: TName
  placeholder?: string
  className?: string
  label?: string
  required?: boolean
  description?: string | React.ReactNode | React.ReactNode
  tooltipText?: string
  control: Control<TFieldValues>
  disabled?: boolean
  items: ListboxItem[]
  onChange?: (value: string | null | undefined) => void
  isLoading?: boolean
}

export function ListboxField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  items,
  name,
  placeholder,
  label = capitalize(name),
  disabled,
  required,
  tooltipText,
  description,
  className,
  control,
  onChange,
  isLoading,
}: ListboxFieldProps<TFieldValues, TName>) {
  // TODO: recreate this logic
  //   validate: (v) => (required && !v ? `${name} is required` : undefined),
  const { field, fieldState } = useController({ name, control, rules: { required } })
  return (
    <div className={cn('max-w-lg', className)}>
      <Listbox
        description={description}
        label={label}
        tooltipText={tooltipText}
        required={required}
        placeholder={placeholder}
        selected={field.value || null}
        items={items}
        onChange={(value) => {
          field.onChange(value)
          onChange?.(value)
        }}
        // required to get required error to trigger on blur
        // onBlur={field.onBlur}
        disabled={disabled}
        name={name}
        hasError={fieldState.error !== undefined}
        isLoading={isLoading}
      />
      <ErrorMessage error={fieldState.error} label={label} />
    </div>
  )
}
