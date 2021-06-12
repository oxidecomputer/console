import type { FC } from 'react'
import React from 'react'
import type { TextInputGroupProps } from './Text'
import { InputGroup } from '../Group'
import { Input } from '../Input'

// Extending `TextFieldProps` here as a way to distinguish this component from TextField
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmailInputGroupProps extends TextInputGroupProps {}

export const EmailInputGroup: FC<EmailInputGroupProps> = ({
  id,
  value,
  placeholder,
  onChange,

  ...fieldProps
}) => {
  return (
    <InputGroup id={id} {...fieldProps}>
      <Input
        id={id}
        type="email"
        value={value}
        placeholder={placeholder}
        autoComplete="email"
        onChange={(e) => onChange?.(e.target.value)}
      />
    </InputGroup>
  )
}
