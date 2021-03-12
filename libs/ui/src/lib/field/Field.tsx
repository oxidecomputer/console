import React, { useEffect } from 'react'

import styled, { css } from 'styled-components'

import { Icon, IconProps } from '../icon/Icon'
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
  /**
   * Additional text to associate with this specific field
   */
  hint?: string | React.ReactNode
  icon?: { align: 'left' | 'right' } & IconProps
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
  color: ${({ theme }) => theme.color('gray100')};
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

  padding-bottom: ${({ theme }) => theme.spacing(1)};
`

const OptionalText = styled(Text).attrs({
  font: 'mono',
  weight: 400,
  size: 'sm',
})``

const HintText = styled(Text).attrs({
  font: 'mono',
  weight: 400,
  size: 'sm',
})`
  display: block;
  padding-bottom: ${({ theme }) => theme.spacing(2)};

  color: ${({ theme }) => theme.color('gray300')};
`

const InputWrapper = styled.div`
  position: relative;
`

const StyledIcon = styled(Icon)<{ align: 'left' | 'right' }>`
  z-index: 1;
  position: absolute;
  top: 0;
  ${({ align, theme }) =>
    align === 'left' &&
    css`
      left: ${theme.spacing(2.5)};
    `};
  ${({ align, theme }) =>
    align === 'right' &&
    css`
      right: ${theme.spacing(2.5)};
    `};
  bottom: 0;

  margin: 0;
  padding: 0;
  width: ${({ theme }) => theme.spacing(5)};
`

const StyledInput = styled.input<{
  hasError?: boolean
  alignIcon?: 'left' | 'right'
}>`
  display: block;
  margin: 0;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
  width: 100%;

  border: 1px solid transparent;
  background-color: ${({ theme }) => theme.color('gray700')};
  color: ${({ theme }) => theme.color('gray100')};
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: ${({ theme }) => theme.spacing(3.5)};
  line-height: ${1.25 / 0.875};

  &:hover {
    background-color: ${({ theme }) => theme.color('gray800')};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color('green500')};
    box-shadow: 0px 0px 0px 1px ${({ theme }) => theme.color('green500')};
  }

  ${({ alignIcon, theme }) => {
    if (alignIcon === 'left') {
      return css`
        padding-left: ${theme.spacing(9)};
      `
    }
    if (alignIcon === 'right') {
      return css`
        padding-right: ${theme.spacing(9)};
      `
    }
  }};

  ${({ hasError, theme }) =>
    hasError &&
    css`
      border: 1px solid ${theme.color('red500')};

      &:focus {
        border: 1px solid ${theme.color('red500')};
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
  hint,
  icon,
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
  const inputErrorProps = error ? { hasError: true } : {}

  const errorId = error ? `${id}-validation-hint` : ``
  const hintId = hint ? `${id}-hint` : ``
  const inputProps =
    error || hint
      ? {
          ...inputRequiredProps,
          ...inputErrorProps,
          'aria-describedby': `${errorId} ${hintId}`,
        }
      : { ...inputRequiredProps }

  const renderErrorMessage = error ? (
    <ErrorMessage id={`${id}-validation-hint`}>{errorMessage}</ErrorMessage>
  ) : null
  const renderHintMessage = hint ? (
    <HintText id={`${id}-hint`}>{hint}</HintText>
  ) : null

  const hasIcon = !!icon && !!icon.name
  const alignIcon = hasIcon ? icon.align : null
  const renderIcon = hasIcon ? <StyledIcon {...icon} /> : null

  return (
    <StyledField>
      <Label htmlFor={id}>
        {children}
        {required ? null : <OptionalText>Optional</OptionalText>}
      </Label>
      {renderHintMessage}
      <InputWrapper>
        <StyledInput
          alignIcon={alignIcon}
          aria-invalid={error}
          autoComplete={autocomplete}
          onBlur={onBlur}
          onChange={onChange}
          onFocus={onFocus}
          placeholder={placeholder}
          id={id}
          type={type}
          value={value}
          {...inputProps}
        />
        {renderIcon}
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
