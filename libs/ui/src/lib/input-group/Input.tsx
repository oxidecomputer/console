import React from 'react'

export type InputProps = React.ComponentPropsWithRef<'input'> & {
  error?: boolean
  errorId?: string
  hintId?: string
}

export const Input = ({
  required,
  error,
  errorId,
  hintId,
  ...props
}: InputProps) => (
  <input
    className="
      flex-1 py-[0.5625rem] px-3
      text-sm font-sans text-gray-50 
      bg-transparent border-none focus:outline-none
    "
    aria-describedby={errorId || hintId ? `${errorId} ${hintId}` : undefined}
    aria-invalid={error}
    aria-required={required}
    required={required}
    {...props}
  />
)
