import type { FC } from 'react'
import React from 'react'
import type { FieldProps } from './Field'
import { Field } from './Field'
import { Input } from './Input'

export interface TextFieldProps extends FieldProps {
  value: string

  onChange: (value: string) => void

  children: null
}

export const TextField: FC<TextFieldProps> = ({
  value,
  onChange,

  ...fieldProps
}) => (
  <Field {...fieldProps}>
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
    />
  </Field>
)
