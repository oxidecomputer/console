import { useField } from 'formik'
import { Listbox, FieldLabel, TextFieldHint } from '@oxide/ui'
import cn from 'classnames'

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
  const [, { value }, { setValue }] = useField({ name })
  return (
    <div className="max-w-lg">
      <FieldLabel id={`${id}-label`} tip={description} optional={!required}>
        {label}
      </FieldLabel>
      {helpText && <TextFieldHint id={`${id}-help-text`}>{helpText}</TextFieldHint>}
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
