import type { FC } from 'react'
import React from 'react'
import type { TextFieldProps } from './TextField'
import { Field } from '../field'
import { Input } from '../Input'

// Extending `TextFieldProps` here as a way to distinguish this component from TextField
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmailFieldProps extends TextFieldProps {}

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
