/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { useId } from 'react'
import { Controller, type FieldPathByValue, type FieldValues } from 'react-hook-form'

import { FieldLabel } from '~/ui/lib/FieldLabel'
import { NumberInput } from '~/ui/lib/NumberInput'
import { TextInputHint } from '~/ui/lib/TextInput'
import { capitalize } from '~/util/str'

import { ErrorMessage } from './ErrorMessage'
import type { TextFieldProps } from './TextField'

export function NumberField<
  TFieldValues extends FieldValues,
  // can only be used on fields with number values
  TName extends FieldPathByValue<TFieldValues, number>,
>({
  name,
  label = capitalize(name),
  units,
  tooltipText,
  description,
  required,
  ...props
}: Omit<TextFieldProps<TFieldValues, TName>, 'id'>) {
  // id is omitted from props because we generate it here
  const id = useId()
  return (
    <div className="max-w-lg">
      <div className="mb-2">
        <FieldLabel htmlFor={id} id={`${id}-label`} tip={tooltipText} optional={!required}>
          {label} {units && <span className="ml-1 text-secondary">({units})</span>}
        </FieldLabel>
        {description && (
          <TextInputHint id={`${id}-help-text`} className="mb-2">
            {description}
          </TextInputHint>
        )}
      </div>
      {/* passing the generated id is very important for a11y */}
      <NumberFieldInner name={name} {...props} id={id} />
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
  control,
  tooltipText,
  required,
  id: idProp,
  disabled,
  max,
  min = 0,
}: TextFieldProps<TFieldValues, TName>) => {
  const generatedId = useId()
  const id = idProp || generatedId

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required, validate }}
      render={({ field, fieldState: { error } }) => {
        return (
          <>
            <NumberInput
              id={id}
              error={!!error}
              aria-labelledby={cn(`${id}-label`, {
                [`${id}-help-text`]: !!tooltipText,
              })}
              aria-describedby={tooltipText ? `${id}-label-tip` : undefined}
              isDisabled={disabled}
              maxValue={max ? Number(max) : undefined}
              minValue={min !== undefined ? Number(min) : undefined}
              {...field}
              formatOptions={{
                useGrouping: false,
              }}
            />
            <ErrorMessage error={error} label={label} />
          </>
        )
      }}
    />
  )
}
