import React, { useState, useEffect } from 'react'
import 'twin.macro'

import type { InputGroupProps } from '../group'
import { InputGroup } from '../group'
import { Input } from '../Input'
import { Controls } from './Controls'
import { KEYS } from '../../keys-utils'

export interface NumberInputGroupProps extends InputGroupProps {
  value: number
  defaultValue?: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export const NumberInputGroup = ({
  value,
  defaultValue = 0,
  onChange,
  disabled,
  max,
  min,
  ...fieldProps
}: NumberInputGroupProps) => {
  const [internalValue, setInternalValue] = useState(value.toString())

  // whenever the canonical value changes from outside, update internalValue
  useEffect(() => {
    setInternalValue(value.toString())
  }, [value])

  // updating the other way is conditional on input being a number
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // filter out non-numeric input but allow empty field
    if (/^\d*$/.test(e.target.value)) {
      setInternalValue(e.target.value)

      // only way this can be NaN is if it's empty, but better to be safe and
      // and check for NaN instead of parse failure
      const number = parseInt(e.target.value, 10)
      if (!Number.isNaN(number)) {
        onChange(number)
      }
    }
  }

  // since we filter out non-numeric input, the only time we need to reset to
  // the default value is when the field is left empty
  const handleBlur = () => {
    if (internalValue.trim() === '') {
      onChange(defaultValue)
      setInternalValue(defaultValue.toString())
    }
  }

  const incr = () => {
    if (typeof max === 'undefined' || value < max) {
      onChange(value + 1)
    }
  }
  const decr = () => {
    if (typeof min === 'undefined' || value > min) {
      onChange(value - 1)
    }
  }

  const keyMap = {
    [KEYS.up]: incr,
    [KEYS.down]: decr,
  } as const

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key in keyMap) {
      e.preventDefault()
      keyMap[e.key as keyof typeof keyMap]() // `in` narrowing apparently insufficient
    }
  }

  return (
    <InputGroup disabled={disabled} {...fieldProps}>
      <Input
        type="text"
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        onKeyDown={handleKeyDown}
      />
      <Controls disabled={disabled} onIncrement={incr} onDecrement={decr} />
    </InputGroup>
  )
}
