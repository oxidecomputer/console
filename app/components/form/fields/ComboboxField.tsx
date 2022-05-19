import { useField } from 'formik'
import { Combobox, FieldLabel, TextFieldHint } from '@oxide/ui'
import cn from 'classnames'

export type ComboboxFieldProps = {
  name: string
  id: string
  label: string
  items: string[] // TODO: accept ReactElement[] probably
  disabled?: boolean
  required?: boolean
  helpText?: string
  description?: string
}

export function ComboboxField({
  id,
  items,
  label,
  name,
  disabled,
  required,
  description,
  helpText,
}: ComboboxFieldProps) {
  const { setValue } = useField({ name })[2]
  return (
    <div>
      <FieldLabel id={`${id}-label`} tip={description} optional={!required}>
        {label}
      </FieldLabel>
      {helpText && <TextFieldHint id={`${id}-help-text`}>{helpText}</TextFieldHint>}
      <Combobox
        items={items}
        onSelect={setValue}
        disabled={disabled}
        aria-labelledby={cn(`${id}-label`, {
          [`${id}-help-text`]: !!description,
        })}
        aria-describedby={description ? `${id}-label-tip` : undefined}
      />
    </div>
  )
}
