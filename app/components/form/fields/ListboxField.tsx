import cn from 'classnames'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import type { ListboxItem } from '@oxide/ui'
import { Listbox } from '@oxide/ui'
import { capitalize } from '@oxide/util'

import { ErrorMessage } from './ErrorMessage'

export type ListboxFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = {
  name: TName
  placeholder?: string
  className?: string
  label?: string
  required?: boolean
  helpText?: string
  description?: string
  control: Control<TFieldValues>
  disabled?: boolean
  items: ListboxItem[]
  onChange?: (value: string | null | undefined) => void
  isLoading?: boolean
}

export function ListboxField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  items,
  name,
  placeholder,
  label = capitalize(name),
  disabled,
  required,
  description,
  helpText,
  className,
  control,
  onChange,
  isLoading,
}: ListboxFieldProps<TFieldValues, TName>) {
  // TODO: recreate this logic
  //   validate: (v) => (required && !v ? `${name} is required` : undefined),
  return (
    <div className={cn('max-w-lg', className)}>
      <Controller
        name={name}
        rules={{ required }}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <Listbox
              helpText={helpText}
              label={label}
              description={description}
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
              hasError={error !== undefined}
              isLoading={isLoading}
            />
            <ErrorMessage error={error} label={label} />
          </>
        )}
      />
    </div>
  )
}
