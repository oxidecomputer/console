import type { Theme } from '@oxide/theme'
import type { FC } from 'react'
import React, { useMemo } from 'react'
import type { StyledComponentProps } from 'styled-components'
import styled from 'styled-components'

const StyledInput = styled.input`
  padding: ${({ theme }) => theme.spacing(2.25, 3)};

  background-color: transparent;
  &:hover:not([disabled]) {
    background-color: ${({ theme }) => theme.color('gray800')};
  }

  border: none;
  color: ${({ theme }) => theme.color('gray100')};
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: ${({ theme }) => theme.spacing(3.5)};
  line-height: ${1.25 / 0.875};

  &:focus {
    outline: none;
  }
`

export type InputProps = StyledComponentProps<
  'input',
  Theme,
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
}) => {
  const describedBy = useMemo(
    () => (errorId || hintId ? `${errorId} ${hintId}` : undefined),
    [errorId, hintId]
  )

  return (
    <StyledInput
      aria-describedby={describedBy}
      aria-invalid={error}
      aria-required={required}
      required={required}
      {...props}
    />
  )
}
