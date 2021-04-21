import type { FC } from 'react'
import { useEffect } from 'react'
import React, { useState } from 'react'
import type { FieldProps } from '../Field'
import { Field } from '../Field'
import { Input } from '../Input'
import { Controls } from './Controls'
import styled from 'styled-components'

const StyledInput = styled(Input)`
  appearance: textfield;

  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

export interface NumberFieldProps extends FieldProps {
  value: number

  onChange: (value: number) => void
}

export const NumberField: FC<NumberFieldProps> = ({
  value,
  onChange,

  ...fieldProps
}) => {
  const [internalValue, setInternalValue] = useState(value.toString())

  useEffect(() => {
    setInternalValue((internalValue) => {
      const parsedInternalValue = parseFloat(internalValue)

      if (parsedInternalValue !== value) {
        return value.toString()
      }

      return internalValue
    })
  }, [value])

  return (
    <Field {...fieldProps}>
      <StyledInput
        type="number"
        value={internalValue}
        onChange={(e) => {
          setInternalValue(e.target.value)

          const number = parseFloat(e.target.value)
          if (!Number.isNaN(number) || number.toString() === e.target.value) {
            onChange(number)
          }
        }}
        onBlur={(e) => {
          const number = parseFloat(e.target.value)
          if (Number.isNaN(number)) {
            setInternalValue(value.toString())
          } else {
            setInternalValue(number.toString())
            onChange(number)
          }
        }}
      />
      <Controls
        onIncrement={() => {
          onChange(value + 1)
        }}
        onDecrement={() => {
          onChange(value - 1)
        }}
      />
    </Field>
  )
}
