import type { FC } from 'react'
import React from 'react'
import {
  Container,
  Label,
  Hint,
  InputContainer,
  ErrorMessage,
  InfoPopover,
} from './styles'
import type { InputGroupProps } from './types'

export const InputGroup: FC<InputGroupProps> = ({
  id,
  required,
  disabled,
  error,
  hint,
  label,
  info,
  children,
}) => {
  const errorId = error ? `${id}-validation-hint` : ''
  const hintId = hint ? `${id}-hint` : ''

  return (
    <Container disabled={disabled}>
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
