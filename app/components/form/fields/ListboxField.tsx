import cn from 'classnames'
import { useField } from 'formik'

import { FieldLabel, Listbox, TextFieldHint } from '@oxide/ui'

export type ListboxFieldProps = {
  name: string
  id: string
  label: string
  items: { value: string; label: string }[]
  disabled?: boolean
  required?: boolean
  helpText?: string
  description?: string
}

export function ListboxField({
  id,
  items,
  label,
  name,
  disabled,
  required,
  description,
  helpText,
}: ListboxFieldProps) {
  type ItemValue = typeof items[number]['value'] | undefined
  const [, { value }, { setValue }] = useField<ItemValue>({
    name,
    validate: (v) => (required && !v ? `${name} is required` : undefined),
  })
  return (
    <div className="max-w-lg">
      <div className="mb-2">
        <FieldLabel id={`${id}-label`} tip={description} optional={!required}>
          {label}
        </FieldLabel>
        {helpText && <TextFieldHint id={`${id}-help-text`}>{helpText}</TextFieldHint>}
      </div>
      <Listbox
        defaultValue={value}
        items={items}
        onChange={(i) => setValue(i?.value)}
        disabled={disabled}
        aria-labelledby={cn(`${id}-label`, {
          [`${id}-help-text`]: !!description,
        })}
        aria-describedby={description ? `${id}-label-tip` : undefined}
        name={name}
      />
    </div>
  )
}
