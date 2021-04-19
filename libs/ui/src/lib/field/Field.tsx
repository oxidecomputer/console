import React, { useMemo } from 'react'
import type { FC, ReactNode } from 'react'
import type { StyledComponentProps } from 'styled-components'
import styled, { css } from 'styled-components'
import Text from '../text/Text'
import type { Theme } from '@oxide/theme'

export interface FieldProps {
  /**
   * Unique identifier for this field in the form.
   */
  id: string
  /**
   * Is this field disabled?
   */
  disabled?: boolean
  /**
   * Is the field required in the form.
   */
  required?: boolean
  /**
   * Label for this field.
   */
  label: ReactNode
  /**
   * Required for accessibility. Defaults to `false`. Input is invalid
   */
  error?: boolean
  /**
   * Error message text to render
   */
  errorMessage?: string
  /**
   * Additional text to associate with this specific field
   */
  hint?: ReactNode

  children: ReactNode
}

const Container = styled.div<Pick<FieldProps, 'disabled'>>`
  color: ${({ theme }) => theme.color('gray100')};

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.4;
    `}
`

/* LABEL */

const LabelContainer = styled.label`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;

  padding-bottom: ${({ theme }) => theme.spacing(1)};
`

type LabelProps = StyledComponentProps<
  'label',
  Theme,
  Pick<FieldProps, 'required'>,
  never
>
const Label: FC<LabelProps> = ({ required, children, ...labelProps }) => (
  <LabelContainer {...labelProps}>
    <Text size="sm" weight={500}>
      {children}
    </Text>
    {!required && <Text size="sm">Optional</Text>}
  </LabelContainer>
)

/* HINT */

const HintContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};

  color: ${({ theme }) => theme.color('gray300')};
`

const Hint: FC<{ id: string }> = ({ id, children }) => (
  <HintContainer id={id}>
    <Text size="sm" weight={500}>
      {children}
    </Text>
  </HintContainer>
)

/* INPUT CONTAINER */

const InputContainer = styled.div<Pick<FieldProps, 'error'>>`
  display: flex;
  flex-direction: row;

  background-color: ${({ theme }) => theme.color('gray700')};
  border: 1px solid transparent;

  :focus-within {
    border-color: ${({ theme, error }) =>
      theme.color(error ? 'red500' : 'green500')};
    ${({ theme, error }) =>
      error
        ? css`
            box-shadow: 0px 1px 2px ${theme.color('black', 0.05)},
              0px 0px 0px 1px #ef4444;
          `
        : css`
            box-shadow: 0px 0px 0px 1px ${theme.color('green500')};
          `}
  }
`

/* ERROR */

const ErrorContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
`
const ErrorMessage: FC<{ id: string }> = ({ id, children }) => (
  <ErrorContainer id={id}>{children}</ErrorContainer>
)

/* FIELD */

export const Field: FC<FieldProps> = ({
  id,
  required,
  error,
  errorMessage,
  hint,
  label,
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
      <InputContainer error={error}>{children}</InputContainer>
      {error && <ErrorMessage id={errorId}>{errorMessage}</ErrorMessage>}
    </Container>
  )
}
