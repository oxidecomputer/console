import type { FC } from 'react'
import React from 'react'
import type { FieldProps } from '../Field'
import { Field } from '../Field'
import { Input } from '../Input'

export interface EmailFieldProps extends FieldProps {
  value: string
  placeholder?: string

  onChange: (value: string) => void

  children: null
}

export const EmailField: FC<EmailFieldProps> = ({
  id,
  value,
  placeholder,
  onChange,

  ...fieldProps
}) => {
  return (
    <Field id={id} {...fieldProps}>
      <Input
        id={id}
        type="email"
        value={value}
        placeholder={placeholder}
        autoComplete="email"
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    </Field>
  )
}
