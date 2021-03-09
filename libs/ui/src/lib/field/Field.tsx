import React from 'react'

import styled, { css } from 'styled-components'

import { Icon } from '../icon/Icon'
import { Text } from '../text/Text'

/* eslint-disable-next-line */
export interface FieldProps {
  /**
   * Commonly used fields can often be filled out automatically by the browser
   */
  autocomplete?: string
  /**
   * Text or element used as children of the `label` element
   */
  children: string | React.ReactNode
  /**
   * input is invalid
   */
  error: boolean
  /**
   * Error message text to render
   */
  errorMessage?: string
  id: string
  onBlur?: () => void
  onChange?: () => void
  onFocus?: () => void
  placeholder?: string
  /**
   * Optional or required
   */
  required: boolean
  /**
   * type of `input`, e.g. email, text, tel, etc.
   */
  type: string
  /**
   * Current value of the input
   */
  value?: string
}

const StyledField = styled.div`
  color: ${(props) => props.theme.color('gray100')};
`

const Label = styled(Text).attrs({
  as: 'label',
  font: 'mono',
  weight: 500,
  size: 'base',
})<{
  htmlFor?: string
}>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  padding-bottom: ${(props) => props.theme.spacing(1)};
`

const HelperText = styled(Text).attrs({
  font: 'mono',
  weight: 400,
  size: 'sm',
})``

const InputWrapper = styled.div`
  position: relative;
`

const ErrorIcon = styled(Icon).attrs({ name: 'warning', color: 'red500' })`
  z-index: 1;
  position: absolute;
  top: 0;
  right: 0.5em;
  bottom: 0;

  margin: 0;
  padding: 0;
  width: 1em;
`

const StyledInput = styled.input<{ hasError?: boolean }>`
  display: block;
  margin: 0;
  padding: ${(props) => `${props.theme.spacing(2)} ${props.theme.spacing(3)}`};
  width: 100%;

  border: 1px solid transparent;
  background-color: ${(props) => props.theme.color('gray700')};
  color: ${(props) => props.theme.color('gray100')};
  font-family: ${(props) => props.theme.fonts.sans};
  font-size: ${(props) => props.theme.spacing(3.5)};
  line-height: ${1.25 / 0.875};

  &:hover {
    background-color: ${(props) => props.theme.color('gray800')};
  }

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.color('green500')};
    box-shadow: 0px 0px 0px 1px ${(props) => props.theme.color('green500')};
  }

  ${(props) =>
    props.hasError &&
    css`
      border: 1px solid ${props.theme.color('red500')};
      padding-right: 2em;

      &:focus {
        border: 1px solid ${props.theme.color('red500')};
        box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05), 0px 0px 0px 1px #ef4444;
      }
    `}
`

const ErrorMessage = styled(Text).attrs({
  as: 'div',
  font: 'mono',
  size: 'xs',
})`
  margin-top: ${(props) => props.theme.spacing(2)};
`

export const Field = ({
  autocomplete,
  children,
  error,
  errorMessage,
  id,
  onBlur,
  onChange,
  onFocus,
  placeholder,
  required,
  type,
  value,
}: FieldProps) => {
  const inputRequiredProps = required ? { 'aria-required': true, required } : {}
  const renderErrorMessage = error ? (
    <ErrorMessage id={`${id}-validation-hint`}>{errorMessage}</ErrorMessage>
  ) : null
  const inputErrorProps = error
    ? { 'aria-describedby': `${id}-validation-hint`, hasError: true }
    : {}

  return (
    <StyledField>
      <Label htmlFor={id}>
        {children}
        {required ? null : <HelperText>Optional</HelperText>}
      </Label>
      <InputWrapper>
        <StyledInput
          aria-invalid={error}
          autoComplete={autocomplete}
          onBlur={onBlur}
          onChange={onChange}
          onFocus={onFocus}
          placeholder={placeholder}
          id={id}
          type={type}
          value={value}
          {...inputRequiredProps}
          {...inputErrorProps}
        />
        {error ? <ErrorIcon /> : null}
      </InputWrapper>
      {renderErrorMessage}
    </StyledField>
  )
}

Field.defaultProps = {
  error: false,
  required: false,
  type: 'text',
}

export default Field
