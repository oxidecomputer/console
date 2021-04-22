import type { FC } from 'react'
import React, { useMemo } from 'react'
import {
  Container,
  Label,
  Hint,
  InputContainer,
  ErrorMessage,
  InfoPopover,
} from './styles'
import type { FieldProps } from './types'

export const Field: FC<FieldProps> = ({
  id: id,
  required,
  error,
  hint,
  label,
  info,
  children,
}) => {
  const errorId = useMemo(() => (error ? `${id}-validation-hint` : ''), [
    error,
    id,
  ])
  const hintId = useMemo(() => (hint ? `${id}-hint` : ''), [hint, id])

  return (
    <Container>
      <Label required={required} htmlFor={id}>
        {label}
      </Label>
      {hint && <Hint id={hintId}>{hint}</Hint>}
      <InputContainer error={error}>
        {children}
        {info && <InfoPopover>{info}</InfoPopover>}
      </InputContainer>
      {error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}
    </Container>
  )
}
