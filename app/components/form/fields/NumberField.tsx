/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { useId } from 'react'
import { useController, type FieldPathByValue, type FieldValues } from 'react-hook-form'

import { FieldLabel } from '~/ui/lib/FieldLabel'
import { NumberInput } from '~/ui/lib/NumberInput'
import { TextInputHint } from '~/ui/lib/TextInput'
import { capitalize } from '~/util/str'

import { ErrorMessage } from './ErrorMessage'
import type { TextFieldProps } from './TextField'

type NumberFieldProps<
  T extends FieldValues,
  N extends FieldPathByValue<T, number>,
> = TextFieldProps<T, N> & {
  /** Counts and resource sizes require whole numbers; byte quotas can use fractional GiB. */
  allowDecimals?: boolean
}

export function NumberField<
  TFieldValues extends FieldValues,
  // can only be used on fields with number values
  TName extends FieldPathByValue<TFieldValues, number>,
>({
  name,
  label = capitalize(name),
  units,
  description,
  required,
  ...props
}: Omit<NumberFieldProps<TFieldValues, TName>, 'id'>) {
  // id is omitted from props because we generate it here
  const id = useId()
  return (
    <div className="max-w-lg">
      <div className="mb-2">
        <FieldLabel htmlFor={id} id={`${id}-label`} optional={!required}>
          {label} {units && <span className="text-default ml-1">({units})</span>}
        </FieldLabel>
        {description && (
          <TextInputHint id={`${id}-help-text`} className="mb-2">
            {description}
          </TextInputHint>
        )}
      </div>
      {/* passing the generated id is very important for a11y */}
      <NumberFieldInner
        name={name}
        id={id}
        label={label}
        units={units}
        required={required}
        {...props}
      />
    </div>
  )
}

/**
 * Primarily exists for `NumberField`, but we occasionally also need a plain field
 * without a label on it.
 *
 * Note that `id` is an allowed prop, unlike in `NumberField`, where it is always
 * generated from `name`. This is because we need to pass the generated ID in
 * from there to here. For the case where `NumberFieldInner` is used
 * independently, we also generate an ID for use only if none is passed in.
 */
export const NumberFieldInner = <
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, number>,
>({
  name,
  label = capitalize(name),
  validate,
  deps,
  control,
  required,
  id: idProp,
  disabled,
  max,
  min = 0,
  allowDecimals = false,
  units,
}: NumberFieldProps<TFieldValues, TName>) => {
  const generatedId = useId()
  const id = idProp || generatedId

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      required,
      deps,
      // RHF's required rule doesn't catch NaN, and its min/max rules don't
      // know about units, so we do all three here. The input itself no longer
      // clamps, so this is what stops out-of-range values.
      validate(value, values) {
        if (Number.isNaN(value)) return required ? `${label} is required` : undefined
        if (!allowDecimals && !Number.isInteger(value)) return 'Must be a whole number'
        const suffix = units ? ` ${units}` : ''
        if (min !== undefined && value < Number(min))
          return `Must be at least ${min}${suffix}`
        if (max !== undefined && value > Number(max))
          return `Can be at most ${max}${suffix}`
        return validate?.(value, values)
      },
    },
  })

  return (
    <>
      <NumberInput
        id={id}
        error={!!error}
        aria-labelledby={cn(`${id}-label`)}
        isDisabled={disabled}
        maxValue={max ? Number(max) : undefined}
        minValue={min !== undefined ? Number(min) : undefined}
        {...field}
        formatOptions={{ useGrouping: false }}
      />
      <ErrorMessage error={error} label={label} />
    </>
  )
}
