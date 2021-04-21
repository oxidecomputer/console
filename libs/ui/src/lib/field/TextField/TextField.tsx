import type { FC } from 'react'
import React from 'react'
import type { FieldProps } from '../Field'
import { Field } from '../Field'
import { Input } from '../Input'

export interface TextFieldProps extends FieldProps {
  value: string
  placeholder?: string

  onChange: (value: string) => void

  children: null
}

export const TextField: FC<TextFieldProps> = ({
  id,
  value,
  placeholder,
  onChange,

  ...fieldProps
}) => (
  <Field id={id} {...fieldProps}>
    <Input
      id={id}
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange && onChange(e.target.value)}
    />
  </Field>
)
