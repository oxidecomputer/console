import type { ChangeEvent, FC, FocusEvent } from 'react'
import React, { useState, useEffect } from 'react'
import type { InputGroupProps } from '../group'
import { InputGroup } from '../group'
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

const useNumberInputGroup = (
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Always store what's typed
    setInternalValue(e.target.value)

    // try to convert it to a number
    const number = parseFloat(e.target.value)
    // if it's a valid number, send it out of the component,
    if (!Number.isNaN(number)) {
      onChange(number)
    }
    // Otherwise do nothing as the user is probably in the process of tying something in
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    // Try to parse the number
    const number = parseFloat(e.target.value)

    // if it is not a valid number
    if (Number.isNaN(number)) {
      // reset the input to the current value
      setInternalValue(value.toString())
    }
  }

  return { internalValue, handleChange, handleBlur }
}

export interface NumberInputGroupProps extends InputGroupProps {
  /** Value this field should display */
  value: number

  /** Fires when the value entered in the textbox is a valid number, or when the field blurs. */
  onChange: (value: number) => void
}

export const NumberInputGroup: FC<NumberInputGroupProps> = ({
  value,
  onChange,

  disabled,
  ...fieldProps
}) => {
  const { internalValue, handleChange, handleBlur } = useNumberInputGroup(
    value,
    onChange
  )

  const handleControls = (delta: number) => () => {
    onChange(value + delta)
  }

  return (
    <InputGroup disabled={disabled} {...fieldProps}>
      <StyledInput
        type="number"
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
      />
      <Controls
        disabled={disabled}
        onIncrement={handleControls(1)}
        onDecrement={handleControls(-1)}
      />
    </InputGroup>
  )
}
