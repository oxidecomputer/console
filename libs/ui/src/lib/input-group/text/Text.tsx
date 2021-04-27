import type { FC } from 'react'
import React from 'react'
import type { InputGroupProps } from '../group'
import { InputGroup } from '../group'
import { Input } from '../Input'

export interface TextInputGroupProps extends Omit<InputGroupProps, 'children'> {
  /** The value the input should show, similar to `value` on `<input>` */
  value: string
  /** Placeholder string for the input */
  placeholder?: string

  /** onChange handler for the field, automatically maps e.target.value from the event object */
  onChange: (value: string) => void

  /** TextField should never have children */
  children?: never
}

export const TextInputGroup: FC<TextInputGroupProps> = ({
  id,
  value,
  placeholder,
  onChange,

  disabled,
  ...fieldProps
}) => (
  <InputGroup id={id} disabled={disabled} {...fieldProps}>
    <Input
      id={id}
      type="text"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange && onChange(e.target.value)}
    />
  </InputGroup>
)
