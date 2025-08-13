/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useState } from 'react'
import {
  useController,
  type Control,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
  type Validate,
} from 'react-hook-form'

import {
  Combobox,
  getSelectedLabelFromValue,
  type ComboboxBaseProps,
} from '~/ui/lib/Combobox'
import { capitalize } from '~/util/str'

import { FieldWrapper } from './FieldWrapper'

export type ComboboxFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  variant?: 'default' | 'inline'
  name: TName
  control: Control<TFieldValues>
  onChange?: (value: string | null | undefined) => void
  validate?: Validate<FieldPathValue<TFieldValues, TName>, TFieldValues>
  /** Will default to name if not provided */
  label?: string
  /**
   * Displayed inline as supplementary text to the label. Should
   * only be used for text that's necessary context for helping
   * complete the input. This will be announced in tandem with the
   * label when using a screen reader.
   */
  description?: React.ReactNode
  required?: boolean
  hideOptionalTag?: boolean
} & ComboboxBaseProps

export function ComboboxField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  // TODO: constrain TValue to extend string
>({
  variant = 'default',
  control,
  name,
  label = capitalize(name),
  required,
  onChange,
  allowArbitraryValues,
  placeholder,
  // Intent is to not show both a placeholder and a description, while still having good defaults; prefer a description to a placeholder
  /*
   * If description is provided, use it.
   * If not, but a placeholder is provided, the default description should be undefined.
   * If no placeholder is provided and arbitrary values are allowed, the default description should be 'Select an option or enter a custom value'.
   * If no placeholder is provided and arbitrary values are not allowed, the default description should be 'Select an option'.
   */
  description = placeholder
    ? undefined
    : allowArbitraryValues
      ? 'Select an option or enter a custom value'
      : 'Select an option',
  items,
  transform,
  validate,
  hideOptionalTag,
  ...props
}: ComboboxFieldProps<TFieldValues, TName>) {
  const { field, fieldState } = useController({
    name,
    control,
    rules: { required, validate },
  })
  const [selectedItemLabel, setSelectedItemLabel] = useState(
    getSelectedLabelFromValue(items, field.value || '')
  )

  return (
    <FieldWrapper
      variant={variant}
      label={label}
      description={description}
      required={required}
      hideOptionalTag={hideOptionalTag}
      error={fieldState.error}
      errorLabel={label}
    >
      {({ id, 'aria-labelledby': ariaLabelledBy }) => (
        <Combobox
          id={id}
          placeholder={placeholder}
          items={items}
          selectedItemValue={field.value}
          selectedItemLabel={selectedItemLabel}
          hasError={fieldState.error !== undefined}
          aria-labelledby={ariaLabelledBy}
          onChange={(value) => {
            field.onChange(value)
            onChange?.(value)
            setSelectedItemLabel(getSelectedLabelFromValue(items, value))
          }}
          allowArbitraryValues={allowArbitraryValues}
          inputRef={field.ref}
          transform={transform}
          {...props}
        />
      )}
    </FieldWrapper>
  )
}
