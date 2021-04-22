import type { ChangeEvent, FC, KeyboardEvent } from 'react'
import React, { useState, useEffect } from 'react'
import type { FieldProps } from '../field'
import { Field } from '../field'
import { Input } from '../Input'
import { Controls } from './Controls'
import styled from 'styled-components'
import { KEYS } from '../../keys-utils'

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
  defaultValue: number,
  onChange: (newValue: number) => void
) => {
  const [internalValue, setInternalValue] = useState(value.toString())

  useEffect(() => {
    setInternalValue(value.toString())
  }, [value])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // filter out non-numeric input
    if (/^\d*$/.test(e.target.value)) {
      setInternalValue(e.target.value)

      // because we're filtering out non-numeric input, the only way this can be NaN
      // is if it's empty
      const number = parseFloat(e.target.value)
      if (!Number.isNaN(number)) {
        onChange(number)
      }
    }
  }

  const handleBlur = () => {
    if (internalValue.trim() === '') {
      onChange(defaultValue)
      setInternalValue(defaultValue.toString())
    }
  }

  return { internalValue, handleChange, handleBlur }
}

export interface NumberFieldProps extends FieldProps {
  /** Value this field should display */
  value: number

  /** Initial value and value reverted to on blur when field is cleared out */
  defaultValue: number

  /** Fires when the value entered in the textbox is a valid number, or when the field blurs. */
  onChange: (value: number) => void
}

export const NumberField: FC<NumberFieldProps> = ({
  value,
  defaultValue = 0,
  onChange,
  disabled,
  ...fieldProps
}) => {
  const { internalValue, handleChange, handleBlur } = useNumberField(
    value,
    defaultValue,
    onChange
  )

  const handleControls = (delta: number) => () => {
    onChange(value + delta)
  }

  const handleArrowKeys = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === KEYS.up) {
      handleControls(1)()
    } else if (event.key === KEYS.down) {
      handleControls(-1)()
    }
  }

  return (
    <Field disabled={disabled} {...fieldProps}>
      <StyledInput
        type="text"
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        onKeyDown={handleArrowKeys}
      />
      <Controls
        disabled={disabled}
        onIncrement={handleControls(1)}
        onDecrement={handleControls(-1)}
      />
    </Field>
  )
}
