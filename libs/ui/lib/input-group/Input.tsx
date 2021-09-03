import React from 'react'
import cn from 'classnames'

export type InputProps = React.ComponentPropsWithRef<'input'> & {
  error?: boolean
  errorId?: string
  hintId?: string
}

export const inputStyle = `
  flex-1 py-[0.5625rem] px-3
  text-sm font-sans text-gray-50 
  bg-transparent border-none focus:outline-none
`

export const Input = ({
  required,
  error,
  errorId,
  hintId,
  className,
  ...props
}: InputProps) => (
  <input
    className={cn(inputStyle, className)}
    aria-describedby={cn(errorId, hintId) || undefined}
    aria-invalid={error}
    // TODO: not clear this is needed in addition to `required`. MDN says "for backward compatibility"
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-required_attribute
    aria-required={required}
    required={required}
    {...props}
  />
)
