import { useField } from 'formik'
import { Combobox, FieldLabel } from '@oxide/ui'

export type ComboboxFieldProps = {
  name: string
  id: string
  label: string
  items: string[]
  disabled?: boolean
}

export function ComboboxField({ id, items, label, name, disabled }: ComboboxFieldProps) {
  const [, { value }, { setValue }] = useField({ name })
  return (
    <>
      <FieldLabel id={`${id}-label`} /*tip={description} optional={!required}*/>
        {label}
      </FieldLabel>
      <Combobox
        items={items}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSelect={(value) => setValue(value)}
        disabled={disabled}
      />
    </>
  )
}
