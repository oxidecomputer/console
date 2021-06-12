import React from 'react'
import type { InputGroupProps } from '../Group'
import { InputGroup } from '../Group'
import { Input } from '../Input'

export interface TextInputGroupProps extends Omit<InputGroupProps, 'children'> {
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export const TextInputGroup = ({
  id,
  value,
  placeholder,
  onChange,
  disabled,
  ...fieldProps
}: TextInputGroupProps) => (
  <InputGroup id={id} disabled={disabled} {...fieldProps}>
    <Input
      id={id}
      type="text"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
    />
  </InputGroup>
)
