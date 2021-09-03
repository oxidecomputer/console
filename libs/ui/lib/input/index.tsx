import React from 'react'
import cn from 'classnames'

import './input.css'

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
