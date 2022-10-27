import cn from 'classnames'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import type { ListboxItem } from '@oxide/ui'
import { FieldLabel, Listbox, TextInputHint } from '@oxide/ui'
import { capitalize } from '@oxide/util'

export type ListboxFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = {
  name: TName
  className?: string
  label?: string
  required?: boolean
  helpText?: string
  description?: string
  control: Control<TFieldValues>
  disabled?: boolean
  items: ListboxItem[]
}

export function ListboxField<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>
>({
  items,
  name,
  label = capitalize(name),
  disabled,
  required,
  description,
  helpText,
  className,
  control,
}: ListboxFieldProps<TFieldValues, TFieldName>) {
  // TODO: recreate this logic
  //   validate: (v) => (required && !v ? `${name} is required` : undefined),
  const id: string = name
  return (
    <div className={cn('max-w-lg', className)}>
      <div className="mb-2">
        <FieldLabel id={`${id}-label`} tip={description} optional={!required}>
          {label}
        </FieldLabel>
        {helpText && <TextInputHint id={`${id}-help-text`}>{helpText}</TextInputHint>}
      </div>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Listbox
            defaultValue={value}
            items={items}
            onChange={onChange}
            disabled={disabled}
            aria-labelledby={cn(`${id}-label`, {
              [`${id}-help-text`]: !!description,
            })}
            aria-describedby={description ? `${id}-label-tip` : undefined}
            name={name}
          />
        )}
      />
    </div>
  )
}
