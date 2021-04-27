import React from 'react'
import type { FC, ReactEventHandler } from 'react'
import styled, { css } from 'styled-components'
import type { DefaultTheme, StyledComponentProps } from 'styled-components'

import { Text } from '../text/Text'

export type TextFieldProps = StyledComponentProps<
  'input',
  DefaultTheme,
  {
    /**
     * Optional accessory to place to the left of the input, can be an Icon or some other control
     */
    leftAccessory?: React.ReactNode
    /**
     * Optional accessory to place to the right of the input, can be an Icon or some other control
     */
    rightAccessory?: React.ReactNode
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
    hint?: string | React.ReactNode
    onChange?: ReactEventHandler<HTMLInputElement>
    value?: string | number
  },
  never
>

const Wrapper = styled.div<{ disabled: boolean }>`
  color: ${({ theme }) => theme.color('gray100')};

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.4;
    `};
`

const Label = styled(Text).attrs({
  forwardedAs: 'label',
  weight: 500,
  size: 'base',
})<{
  htmlFor?: string
}>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;

  padding-bottom: ${({ theme }) => theme.spacing(1)};
`

const OptionalText = styled(Text).attrs({ size: 'sm' })``

const HintText = styled(Text).attrs({ size: 'sm' })`
  display: block;
  max-width: ${({ theme }) => theme.spacing(100)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};

  color: ${({ theme }) => theme.color('gray300')};
`

const InputWrapper = styled.div<{ hasError: boolean }>`
  display: flex;
  flex-direction: row;

  background-color: ${({ theme }) => theme.color('gray700')};
  border: 1px solid transparent;

  :focus-within {
    border-color: ${({ theme, hasError }) =>
      theme.color(hasError ? 'red500' : 'green500')};
    ${({ theme, hasError }) =>
      hasError
        ? css`
            box-shadow: 0px 1px 2px ${theme.color('black', 0.05)},
              0px 0px 0px 1px #ef4444;
          `
        : css`
            box-shadow: 0px 0px 0px 1px ${theme.color('green500')};
          `}
  }
`

const AccessoryWrapper = styled.span`
  flex: 0 0 auto;

  display: flex;
  align-items: center;
  justify-content: center;
`

const StyledInput = styled.input`
  flex: 1;

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

const ErrorMessage = styled(Text).attrs({ as: 'div', size: 'xs' })`
  margin-top: ${(props) => props.theme.spacing(2)};
`

export const TextField: FC<TextFieldProps> = ({
  children,
  className,
  leftAccessory = null,
  rightAccessory = null,
  disabled = false,
  error = false,
  errorMessage,
  hint,
  id,
  required = false,
  type = 'text',
  ...inputProps
}) => {
  const errorId = error ? `${id}-validation-hint` : ``
  const hintId = hint ? `${id}-hint` : ``

  return (
    <Wrapper disabled={disabled} className={className}>
      <Label htmlFor={id}>
        {children}
        {!required && <OptionalText>Optional</OptionalText>}
      </Label>
      {hint && <HintText id={hintId}>{hint}</HintText>}
      <InputWrapper hasError={!!error}>
        {leftAccessory && <AccessoryWrapper>{leftAccessory}</AccessoryWrapper>}
        <StyledInput
          aria-describedby={error || hint ? `${errorId} ${hintId}` : undefined}
          aria-invalid={error}
          aria-required={required || undefined}
          disabled={disabled}
          id={id}
          required={required}
          type={type}
          {...inputProps}
        />
        {rightAccessory && (
          <AccessoryWrapper>{rightAccessory}</AccessoryWrapper>
        )}
      </InputWrapper>
      {error && <ErrorMessage id={errorId}>{errorMessage}</ErrorMessage>}
    </Wrapper>
  )
}

export default TextField
