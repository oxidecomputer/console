import React from 'react'
import cn from 'classnames'

import { classed } from '../../util/classed'

export const inputStyle = `
  flex-1 py-[0.5625rem] px-3
  text-sm font-sans text-gray-50 
  bg-transparent border-none focus:outline-none
`

export const InputHint = classed.div`flex-1 pb-2 text-gray-50 text-sm font-sans font-light`

export const InputLabel = classed.label`text-lg flex items-baseline font-sans font-light justify-between pb-2`

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
