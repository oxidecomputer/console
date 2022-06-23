import type { TextFieldProps } from './TextField'
import { TextField } from './TextField'

interface DiskSizeProps extends Omit<TextFieldProps, 'validate'> {
  minSize?: number
}

export function DiskSizeField({
  required = true,
  name = 'diskSize',
  minSize = 1,
  ...props
}: DiskSizeProps) {
  return (
    <TextField
      units="GiB"
      type="number"
      required={required}
      name={name}
      min={minSize}
      {...props}
    />
  )
}
