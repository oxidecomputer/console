import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { FieldLabel, FileInput, TextInputHint } from '@oxide/ui'

import { ErrorMessage } from './ErrorMessage'

export function FileField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  id,
  name,
  label,
  description,
  control,
  required = false,
  accept,
  helpText,
}: {
  id: string
  name: TName
  label: string
  description?: string
  control: Control<TFieldValues>
  required?: boolean
  accept?: string
  helpText?: string
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
              tip={description}
              optional={!required}
            >
              {label}
            </FieldLabel>
            {helpText && <TextInputHint id={`${id}-help-text`}>{helpText}</TextInputHint>}
          </div>
          <FileInput id={id} className="mt-2" accept={accept} {...rest} error={!!error} />
          <ErrorMessage error={error} label={label} />
        </div>
      )}
    />
  )
}
