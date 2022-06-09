import cn from 'classnames'
import { useField } from 'formik'

import { Combobox, FieldLabel, TextFieldHint } from '@oxide/ui'

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

// TODO: description passed to aria-describedby and FieldLabel `tip`

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
  const [, { value }, { setValue }] = useField({ name })
  return (
    <div>
      <FieldLabel id={`${id}-label`} tip={description} optional={!required}>
        {label}
      </FieldLabel>
      {helpText && <TextFieldHint id={`${id}-help-text`}>{helpText}</TextFieldHint>}
      <Combobox
        items={items}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSelect={(value) => setValue(value)}
        disabled={disabled}
        aria-labelledby={cn(`${id}-label`, {
          [`${id}-help-text`]: !!description,
        })}
        aria-describedby={description ? `${id}-label-tip` : undefined}
      />
    </div>
  )
}
