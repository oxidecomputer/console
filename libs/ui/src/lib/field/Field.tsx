import React from 'react'

import styled from 'styled-components'

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
  value: string
}

const StyledField = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

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
  flex: 0 0 100%;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const HelperText = styled(Text).attrs({
  font: 'mono',
  weight: 400,
  size: 'sm',
})``

const ErrorIcon = styled(Icon).attrs({ name: 'close', color: 'red500' })`
  z-index: 1;
  flex: 0 0 auto;

  margin-top: ${(props) => props.theme.spacing(1)};
  padding-right: 0.5em;
  width: 1.5em;

  background-color: ${(props) => props.theme.color('gray700')};
  border-top: 1px solid ${(props) => props.theme.color('red500')};
  border-bottom: 1px solid ${(props) => props.theme.color('red500')};
  border-right: 1px solid ${(props) => props.theme.color('red500')};
`

const StyledInput = styled.input<{ hasError?: boolean }>`
  flex: 1 1 0%;

  display: block;
  margin-top: ${(props) => props.theme.spacing(1)};
  padding: ${(props) => `${props.theme.spacing(2)} ${props.theme.spacing(3)}`};
  position: relative;
  width: 100%;

  border: 1px solid transparent;
  background-color: ${(props) => props.theme.color('gray700')};
  color: ${(props) => props.theme.color('gray100')};
  font-family: ${(props) => props.theme.fonts.sans};
  font-size: ${(props) => props.theme.spacing(3.5)};
  line-height: ${1.25 / 0.875};

  ${(props) =>
    props.hasError &&
    `
    margin-right: -1px;

    border-top: 1px solid ${props.theme.color('red500')};
    border-bottom: 1px solid ${props.theme.color('red500')};
    border-left: 1px solid ${props.theme.color('red500')};
  `}

  &:focus, &:focus + ${ErrorIcon} {
    outline: none;
    background-color: ${(props) => props.theme.color('gray800')};
  }
`

const ErrorMessage = styled(Text).attrs({
  as: 'div',
  font: 'mono',
  size: 'xs',
})`
  flex: 0 0 100%;

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
  const renderErrorMessage = error ? (
    <>
      <ErrorIcon />
      <ErrorMessage id={`${id}-validation-hint`}>{errorMessage}</ErrorMessage>
    </>
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
      <StyledInput
        aria-invalid={error}
        aria-required={required}
        autoComplete={autocomplete}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder}
        id={id}
        required={required}
        type={type}
        value={value}
        {...inputErrorProps}
      />
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
