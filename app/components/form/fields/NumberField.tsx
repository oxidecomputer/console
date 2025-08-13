/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useController, type FieldPathByValue, type FieldValues } from 'react-hook-form'

import { NumberInput } from '~/ui/lib/NumberInput'
import { capitalize } from '~/util/str'

import { FieldWrapper } from './FieldWrapper'
import type { TextFieldProps } from './TextField'

export interface NumberFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, number>,
> extends Omit<TextFieldProps<TFieldValues, TName>, 'type' | 'transform'> {
  max?: number
  min?: number
}

export function NumberField<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, number>,
>({
  variant = 'default',
  name,
  label = capitalize(name),
  units,
  description,
  required,
  control,
  validate,
  disabled,
  max,
  min = 0,
  className,
}: Omit<NumberFieldProps<TFieldValues, TName>, 'id'>) {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      required,
      // it seems we need special logic to enforce required on NaN
      validate(value, values) {
        if (required && Number.isNaN(value)) return `${label} is required`
        return validate?.(value, values)
      },
    },
  })

  const labelWithUnits = units ? (
    <>
      {label} <span className="ml-1 text-default">({units})</span>
    </>
  ) : (
    label
  )

  return (
    <FieldWrapper
      variant={variant}
      label={labelWithUnits}
      description={description}
      required={required}
      error={error}
      errorLabel={label}
    >
      {({ id, 'aria-labelledby': ariaLabelledBy }) => (
        <NumberInput
          id={id}
          error={!!error}
          aria-labelledby={ariaLabelledBy}
          isDisabled={disabled}
          maxValue={max ? Number(max) : undefined}
          minValue={min !== undefined ? Number(min) : undefined}
          className={className}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          formatOptions={{ useGrouping: false }}
        />
      )}
    </FieldWrapper>
  )
}
