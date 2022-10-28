import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import type { CheckboxProps } from '@oxide/ui'
import { Checkbox } from '@oxide/ui'

type CheckboxFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = Omit<CheckboxProps, 'name'> & {
  name: TName
  control: Control<TFieldValues>
}

export const CheckboxField = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  control,
  name,
  ...props
}: CheckboxFieldProps<TFieldValues, TName>) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { onChange, value } }) => (
      <Checkbox {...props} onChange={onChange} checked={value} />
    )}
  />
)
