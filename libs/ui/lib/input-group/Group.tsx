import React from 'react'
import cn from 'classnames'

import { classed } from '../../util/classed'

const Hint = classed.div`flex-1 pb-2 text-gray-50 text-sm font-sans font-light`
export const InputHint = Hint

const Label = classed.label`text-lg flex items-baseline font-sans font-light justify-between pb-2`
export const InputLabel = Label

export interface InputGroupProps {
  id: string
  disabled?: boolean
  label: string | React.ReactFragment
  error?: string
  hint?: React.ReactNode
  /**
   * Additional text to show in a popover inside the text field.
   * Should not be requried to understand the use of the field
   */
  children: React.ReactNode
  className?: string
}

export const InputGroup = ({
  id,
  disabled,
  error,
  hint,
  label,
  children,
  className,
}: InputGroupProps) => {
  const errorId = error ? `${id}-validation-hint` : ''
  const hintId = hint ? `${id}-hint` : ''

  return (
    <div className={cn('flex flex-col text-gray-50 flex-1', className)}>
      <Label htmlFor={id}>{label}</Label>
      {hint && <Hint id={hintId}>{hint}</Hint>}
      <div
        className={cn(
          'flex border border-gray-400 rounded',
          'focus-within:border-green-500 hover:focus-within:border-green-500',
          error && '!border-red-500',
          !disabled && 'hover:border-gray-300'
        )}
      >
        {children}
      </div>
      {error && (
        <div id={errorId} className="mt-2 text-xs">
          {error}
        </div>
      )}
    </div>
  )
}

type InputBorderProps = {
  error?: string
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

export const InputBorder = ({
  error,
  disabled,
  className,
  children,
}: InputBorderProps) => (
  <div
    className={cn(
      'flex border border-gray-400 rounded',
      'focus-within:border-green-500 hover:focus-within:border-green-500',
      error && '!border-red-500',
      !disabled && 'hover:border-gray-300',
      className
    )}
  >
    {children}
  </div>
)
