import React from 'react'
import cn from 'classnames'

import './input.css'

// this is a text field, don't let the caller pass in a type
type InputProps = Omit<React.ComponentProps<'input'>, 'type'>

type TextFieldProps = InputProps & {
  error?: string
  disabled?: boolean
  className?: string
}

export const TextField = ({
  error,
  disabled,
  className,
  ...inputProps
}: TextFieldProps) => (
  <div
    className={cn(
      'flex border border-gray-400 rounded',
      'focus-within:border-green-500 hover:focus-within:border-green-500',
      error && '!border-red-500',
      !disabled && 'hover:border-gray-300',
      className
    )}
  >
    <input
      type="text"
      className={`
        py-[0.5625rem] px-3 w-full
        text-sm font-sans text-gray-50 
        bg-transparent border-none focus:outline-none`}
      {...inputProps}
    />
  </div>
)
