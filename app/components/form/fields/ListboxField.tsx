import cn from 'classnames'
import { useField } from 'formik'

import type { ListboxProps } from '@oxide/ui'
import { FieldLabel, Listbox, TextInputHint } from '@oxide/ui'

export type ListboxFieldProps = {
  name: string
  id: string
  label: string
  required?: boolean
  helpText?: string
  description?: string
} & Pick<ListboxProps, 'disabled' | 'items' | 'onChange'>

export function ListboxField({
  id,
  items,
  label,
  name,
  disabled,
  required,
  description,
  helpText,
  onChange,
}: ListboxFieldProps) {
  const [, { value }, { setValue }] = useField<string | undefined>({
    name,
    validate: (v) => (required && !v ? `${name} is required` : undefined),
  })
  return (
    <div className="max-w-lg">
      <div className="mb-2">
        <FieldLabel id={`${id}-label`} tip={description} optional={!required}>
          {label}
        </FieldLabel>
        {helpText && <TextInputHint id={`${id}-help-text`}>{helpText}</TextInputHint>}
      </div>
      <Listbox
        defaultValue={value}
        items={items}
        onChange={(i) => {
          setValue(i?.value)
          onChange?.(i)
        }}
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
