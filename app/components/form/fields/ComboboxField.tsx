/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useCallback, useMemo } from 'react'
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

import { ErrorMessage } from './ErrorMessage'

export type ComboboxFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  name: TName
  control: Control<TFieldValues>
  onChange?: (value: string | null | undefined) => void
  validate?: Validate<FieldPathValue<TFieldValues, TName>, TFieldValues>
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
  onInputChange,
  allowArbitraryValues,
  placeholder,
  description,
  items,
  transform,
  validate,
  ...props
}: ComboboxFieldProps<TFieldValues, TName>) {
  const { field, fieldState } = useController({
    name,
    control,
    rules: { required, validate },
  })

  // Memoize description computation to avoid recalculating on every render
  const memoizedDescription = useMemo(() => {
    // Intent is to not show both a placeholder and a description, while still having good defaults; prefer a description to a placeholder
    /*
     * If description is provided, use it.
     * If not, but a placeholder is provided, the default description should be undefined.
     * If no placeholder is provided and arbitrary values are allowed, the default description should be 'Select an option or enter a custom value'.
     * If no placeholder is provided and arbitrary values are not allowed, the default description should be 'Select an option'.
     */
    return description !== undefined
      ? description
      : placeholder
        ? undefined
        : allowArbitraryValues
          ? 'Select an option or enter a custom value'
          : 'Select an option'
  }, [description, placeholder, allowArbitraryValues])

  // Memoize the selected label calculation to avoid recalculation when items/value haven't changed
  const selectedItemLabel = useMemo(
    () => getSelectedLabelFromValue(items, field.value || ''),
    [items, field.value]
  )

  // Memoize onChange callback to prevent unnecessary re-renders
  const handleChange = useCallback(
    (value: string) => {
      field.onChange(value)
      onChange?.(value)
    },
    [field, onChange]
  )

  // Memoize onInputChange callback to prevent unnecessary re-renders
  const handleInputChange = useCallback(
    (value: string) => {
      // If the user edits the input field, if arbitrary values are allowed, set the field's value; otherwise, clear the selected value
      field.onChange(allowArbitraryValues ? value : undefined)
      onInputChange?.(value)
    },
    [field, allowArbitraryValues, onInputChange]
  )
  return (
    <div className="max-w-lg">
      <Combobox
        label={label}
        placeholder={placeholder}
        description={memoizedDescription}
        items={items}
        required={required}
        selectedItemValue={field.value}
        selectedItemLabel={selectedItemLabel}
        hasError={fieldState.error !== undefined}
        onChange={handleChange}
        onInputChange={handleInputChange}
        allowArbitraryValues={allowArbitraryValues}
        inputRef={field.ref}
        transform={transform}
        {...props}
      />
      <ErrorMessage error={fieldState.error} label={label} />
    </div>
  )
}
