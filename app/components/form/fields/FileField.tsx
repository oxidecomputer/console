/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

import { FieldLabel } from '@oxide/ui'

import { FileInput } from '~/ui/lib/FileInput'
import { TextInputHint } from '~/ui/lib/TextInput'

import { ErrorMessage } from './ErrorMessage'

export function FileField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  id,
  name,
  label,
  tooltipText,
  control,
  required = false,
  accept,
  description,
}: {
  id: string
  name: TName
  label: string
  tooltipText?: string
  control: Control<TFieldValues>
  required?: boolean
  accept?: string
  description?: string | React.ReactNode
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field: { value: _value, ...rest }, fieldState: { error } }) => (
        <div>
          <div className="mb-2">
            <FieldLabel
              id={`${id}-label`}
              htmlFor={id}
              tip={tooltipText}
              optional={!required}
            >
              {label}
            </FieldLabel>
            {description && (
              <TextInputHint id={`${id}-help-text`}>{description}</TextInputHint>
            )}
          </div>
          <FileInput id={id} className="mt-2" accept={accept} {...rest} error={!!error} />
          <ErrorMessage error={error} label={label} />
        </div>
      )}
    />
  )
}
