import type { FC } from 'react'
import React from 'react'
import type { FieldProps } from '../field'
import { Field } from '../field'
import { Input } from '../Input'

export interface TextFieldProps extends Omit<FieldProps, 'children'> {
  /** The value the input should show, similar to `value` on `<input>` */
  value: string
  /** Placeholder string for the input */
  placeholder?: string

  /** onChange handler for the field, automatically maps e.target.value from the event object */
  onChange: (value: string) => void

  /** TextField should never have children */
  children?: never
}

export const TextField: FC<TextFieldProps> = ({
  id,
  value,
  placeholder,
  onChange,

  disabled,
  ...fieldProps
}) => (
  <Field id={id} disabled={disabled} {...fieldProps}>
    <Input
      id={id}
      type="text"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange && onChange(e.target.value)}
    />
  </Field>
)
