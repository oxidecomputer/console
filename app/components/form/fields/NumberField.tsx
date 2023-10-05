/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { useId } from 'react'
import type { FieldPathByValue, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { FieldLabel, TextInputHint, NumberInput as UINumberField } from '@oxide/ui'
import { capitalize } from '@oxide/util'

import { ErrorMessage } from './ErrorMessage'
import type { TextFieldProps } from './TextField'

export function NumberField<
  TFieldValues extends FieldValues,
  // can only be used on fields with number values
  TName extends FieldPathByValue<TFieldValues, number>
>({
  name,
  label = capitalize(name),
  units,
  description,
  helpText,
  required,
  ...props
}: Omit<TextFieldProps<TFieldValues, TName>, 'id'>) {
  // id is omitted from props because we generate it here
  const id = useId()
  return (
    <div className="max-w-lg">
      <div className="mb-2">
        <FieldLabel id={`${id}-label`} tip={description} optional={!required}>
          {label} {units && <span className="ml-1 text-secondary">({units})</span>}
        </FieldLabel>
        {helpText && (
          <TextInputHint id={`${id}-help-text`} className="mb-2">
            {helpText}
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
 * Note that `id` is an allowed prop, unlike in `TextField`, where it is always
 * generated from `name`. This is because we need to pass the generated ID in
 * from there to here. For the case where `TextFieldInner` is used
 * independently, we also generate an ID for use only if none is passed in.
 */
export const NumberFieldInner = <
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, number>
>({
  name,
  label = capitalize(name),
  validate,
  control,
  description,
  required,
  id: idProp,
}: TextFieldProps<TFieldValues, TName>) => {
  const generatedId = useId()
  const id = idProp || generatedId

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required, validate }}
      render={({ field: { value, ...fieldRest }, fieldState: { error } }) => {
        return (
          <>
            <UINumberField
              id={id}
              error={!!error}
              aria-labelledby={cn(`${id}-label`, {
                [`${id}-help-text`]: !!description,
              })}
              aria-describedby={description ? `${id}-label-tip` : undefined}
              defaultValue={value}
              {...fieldRest}
            />
            <ErrorMessage error={error} label={label} />
          </>
        )
      }}
    />
  )
}
