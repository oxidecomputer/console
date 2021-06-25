import React from 'react'
import tw from 'twin.macro'

const StyledInput = tw.input`
  flex-1 padding[0.5625rem .75rem]
  text-sm font-sans text-gray-50 
  bg-transparent border-none focus:outline-none
`
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
  <StyledInput
    aria-describedby={errorId || hintId ? `${errorId} ${hintId}` : undefined}
    aria-invalid={error}
    aria-required={required}
    required={required}
    {...props}
  />
)
