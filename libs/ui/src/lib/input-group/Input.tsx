import { color, spacing } from '@oxide/css-helpers'
import React from 'react'
import tw, { styled } from 'twin.macro'

const StyledInput = styled.input`
  padding: ${spacing(2.25, 3)};

  background-color: transparent;
  &:hover:not([disabled]) {
    background-color: ${color('gray800')};
  }

  border: none;
  color: ${color('gray100')};
  ${tw`font-sans`}
  font-size: ${spacing(3.5)};
  line-height: ${1.25 / 0.875};

  &:focus {
    outline: none;
  }
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
