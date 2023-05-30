import cn from 'classnames'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { useController } from 'react-hook-form'
import { Item } from 'react-stately'

import type { ListboxItem } from '@oxide/ui'
import { ComboBox, FieldLabel, TextInputHint } from '@oxide/ui'
import { capitalize } from '@oxide/util'

import { useUuid } from 'app/hooks'

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
  onChange?: (value: string) => void
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
}: ListboxFieldProps<TFieldValues, TName>) {
  // TODO: recreate this logic
  //   validate: (v) => (required && !v ? `${name} is required` : undefined),
  const id = useUuid(name)

  const {
    field,
    fieldState: { error },
  } = useController({ control, name, rules: { required } })

  return (
    <div className={cn('max-w-lg', className)}>
      <div className="mb-2">
        <FieldLabel id={`${id}-label`} tip={description} optional={!required}>
          {label}
        </FieldLabel>
        {helpText && <TextInputHint id={`${id}-help-text`}>{helpText}</TextInputHint>}
      </div>
      <ComboBox
        label={label}
        placeholder={placeholder}
        defaultItems={items}
        selectedKey={field.value}
        onSelectionChange={(i) => {
          // Fixes bug where `onSelectionChange` is run twice after
          // an error and the second is null

          // uncomment to see double fire
          // console.log(i)
          if (i) {
            field.onChange(i)
            onChange?.(i.toString())
          }
        }}
        // required to get required error to trigger on blur
        // onBlur={field.onBlur}
        isDisabled={disabled}
        aria-labelledby={cn(`${id}-label`, {
          [`${id}-help-text`]: !!description,
        })}
        aria-describedby={description ? `${id}-label-tip` : undefined}
        name={name}
        hasError={error !== undefined}
      >
        {(item) => (
          <Item key={item.value} textValue={item.labelString}>
            {item.label}
          </Item>
        )}
      </ComboBox>
      <ErrorMessage error={error} label={label} />
    </div>
  )
}
