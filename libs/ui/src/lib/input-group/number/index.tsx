import React, { useState, useEffect } from 'react'
import tw from 'twin.macro'

import type { InputGroupProps } from '../Group'
import { InputGroup } from '../Group'
import { Input } from '../Input'
import { Icon } from '../../icon/Icon'
import { KEYS } from '../../keys-utils'

export interface NumberInputGroupProps extends InputGroupProps {
  value: number
  defaultValue?: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

const ctrl = tw`
  py-2 px-3
  disabled:(text-grey-100 hover:cursor-auto)
  not-disabled:hover:bg-gray-800
  focus:(outline-none shadow-ring-green-500)
`

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

  const incrEnabled = !disabled && (max === undefined || value < max)
  const incr = () => incrEnabled && onChange(value + 1)

  const decrEnabled = !disabled && (min === undefined || value > min)
  const decr = () => decrEnabled && onChange(value - 1)

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
      <div tw="flex">
        <button type="button" css={ctrl} onClick={decr} disabled={!decrEnabled}>
          <Icon name="minus" svgProps={{ title: 'Decrement' }} />
        </button>
        <button type="button" css={ctrl} onClick={incr} disabled={!incrEnabled}>
          <Icon name="plus" svgProps={{ title: 'Increment' }} />
        </button>
      </div>
    </InputGroup>
  )
}
