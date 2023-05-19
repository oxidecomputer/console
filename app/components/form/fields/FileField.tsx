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
  control,
  required = false,
  accept,
  helpText,
}: {
  id: string
  name: TName
  label: string
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
          <FieldLabel id={`${id}-label`} htmlFor={id} className="mb-2">
            {label}
            {error && (
              <span className="ml-2">
                <ErrorMessage error={error} label="File" />
              </span>
            )}
          </FieldLabel>
          {helpText && <TextInputHint id={`${id}-help-text`}>{helpText}</TextInputHint>}
          <FileInput id={id} className="mt-2" accept={accept} {...rest} />
        </div>
      )}
    />
  )
}
