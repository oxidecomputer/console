import React from 'react'
import cn from 'classnames'

import { classed } from '../../util/classed'

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

type HintProps = {
  // ID required as a reminder to pass aria-describedby on TextField
  id: string
  children: React.ReactNode
  className?: string
}

export const TextFieldHint = ({ id, children, className }: HintProps) => (
  <div
    id={id}
    className={cn('text-sm font-sans font-light mb-2 text-gray-50', className)}
  >
    {children}
  </div>
)

export const TextFieldLabel = classed.label`block text-lg font-sans font-light mb-2`
