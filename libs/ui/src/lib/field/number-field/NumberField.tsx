import type { ChangeEvent, FC, FocusEvent } from 'react'
import { useRef } from 'react'
import { useCallback } from 'react'
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

const useNumberField = (
  value: number,
  onChange: (newValue: number) => void
) => {
  const [internalValue, setInternalValue] = useState(value.toString())

  useEffect(() => {
    // using callback version here prevents this effect depending on the value of `internalValue`, which means this _only_ fires when `value` changes from outside
    setInternalValue((internalValue) => {
      // Convert what's currently into the text box into a number
      const parsedInternalValue = parseFloat(internalValue)

      // if the internal number is not the same as the value being passed in
      if (parsedInternalValue !== value) {
        // turn the value being passed into a string and store it in `internalValue`
        return value.toString()
      }

      // Otherwise keep internalValue as is, this means the number representation and the string representation are equivalent
      return internalValue
    })
  }, [value])

  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    // Always store what's typed
    setInternalValue(e.target.value)

    // try to convert it to a number
    const number = parseFloat(e.target.value)
    // if it's a valid number, send it out of the component,
    if (!Number.isNaN(number)) {
      onChangeRef.current(number)
    }
    // Otherwise do nothing as the user is probably in the process of tying something in
  }, [])

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      // Try to parse the number
      const number = parseFloat(e.target.value)

      // if it is not a valid number
      if (Number.isNaN(number)) {
        // reset the input to the current value
        setInternalValue(value.toString())
      }
    },
    [value]
  )

  return { internalValue, handleChange, handleBlur }
}

export interface NumberFieldProps extends FieldProps {
  /** Value this field should display */
  value: number

  /** Fires when the value entered in the textbox is a valid number, or when the field blurs. */
  onChange: (value: number) => void
}

export const NumberField: FC<NumberFieldProps> = ({
  value,
  onChange,

  ...fieldProps
}) => {
  const { internalValue, handleChange, handleBlur } = useNumberField(
    value,
    onChange
  )

  return (
    <Field {...fieldProps}>
      <StyledInput
        type="number"
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
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
