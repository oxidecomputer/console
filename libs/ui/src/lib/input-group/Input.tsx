import { color, spacing } from '@oxide/css-helpers'
import type { FC } from 'react'
import React from 'react'
import type { StyledComponentProps } from 'styled-components'
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

export type InputProps = StyledComponentProps<
  'input',
  never,
  {
    error?: boolean
    errorId?: string
    hintId?: string
  },
  never
>

export const Input: FC<InputProps> = ({
  required,
  error,
  errorId,
  hintId,
  ...props
}) => (
  <StyledInput
    aria-describedby={errorId || hintId ? `${errorId} ${hintId}` : undefined}
    aria-invalid={error}
    aria-required={required}
    required={required}
    {...props}
  />
)
