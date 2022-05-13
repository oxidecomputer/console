import { useField } from 'formik'
import { Combobox, FieldLabel } from '@oxide/ui'

export type ComboboxFieldProps = {
  name: string
  id: string
  label: string
  items: string[] // TODO: accept ReactElement[] probably
  disabled?: boolean
  required?: boolean
}

// TODO: description passed to aria-describedby and FieldLabel `tip`

export function ComboboxField({
  id,
  items,
  label,
  name,
  disabled,
  required,
}: ComboboxFieldProps) {
  const [, { value }, { setValue }] = useField({ name })
  return (
    <>
      <FieldLabel id={`${id}-label`} /*tip={description}*/ optional={!required}>
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
