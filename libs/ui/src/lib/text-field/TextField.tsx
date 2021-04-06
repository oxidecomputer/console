import React from 'react'
import type { FC, ReactEventHandler } from 'react'
import styled, { css } from 'styled-components'
import type { DefaultTheme, StyledComponentProps } from 'styled-components'

import type { IconProps } from '../icon/Icon'
import { Icon } from '../icon/Icon'
import { Text } from '../text/Text'

export type TextFieldProps = StyledComponentProps<
  'input',
  DefaultTheme,
  {
    /**
     * Optional controls that can manipulate the user input (such as increment/decrement)
     */
    controls?: React.ReactNode
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
    icon?: StyledIconProps & IconProps
    onChange?: ReactEventHandler
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

  padding-bottom: ${({ theme }) => theme.spacing(1)};
`

const OptionalText = styled(Text).attrs({ size: 'sm' })``

const HintText = styled(Text).attrs({ size: 'sm' })`
  display: block;
  padding-bottom: ${({ theme }) => theme.spacing(2)};

  color: ${({ theme }) => theme.color('gray300')};
`

const InputWrapper = styled.div`
  position: relative;
`

interface StyledIconProps {
  align: 'left' | 'right'
}
const StyledIcon = styled(Icon)<StyledIconProps>`
  z-index: 1;
  position: absolute;
  top: 0;
  ${({ align, theme }) => align === 'left' && `left: ${theme.spacing(2.5)};`};
  ${({ align, theme }) => align === 'right' && `right: ${theme.spacing(2.5)};`};
  bottom: 0;

  height: 100%;
  width: ${({ theme }) => theme.spacing(5)};
`

type StyledInputType = {
  hasError?: boolean
  alignIcon?: 'left' | 'right'
}

const StyledInput = styled.input<StyledInputType>`
  display: block;
  margin: 0;
  padding: ${({ theme }) => `${theme.spacing(2.25)} ${theme.spacing(3)}`};
  width: 100%;

  border: 1px solid transparent;
  background-color: ${({ theme }) => theme.color('gray700')};
  color: ${({ theme }) => theme.color('gray100')};
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: ${({ theme }) => theme.spacing(3.5)};
  line-height: ${1.25 / 0.875};

  &:hover:not([disabled]) {
    background-color: ${({ theme }) => theme.color('gray800')};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color('green500')};
    box-shadow: 0px 0px 0px 1px ${({ theme }) => theme.color('green500')};
  }

  ${({ alignIcon, theme }) => {
    if (alignIcon === 'left') {
      return `padding-left: ${theme.spacing(9)};`
    }
    if (alignIcon === 'right') {
      return `padding-right: ${theme.spacing(9)};`
    }
  }};

  ${({ hasError, theme }) =>
    hasError &&
    css`
      border: 1px solid ${theme.color('red500')};

      &:focus {
        border: 1px solid ${theme.color('red500')};
        box-shadow: 0px 1px 2px ${theme.color('black', 0.05)},
          0px 0px 0px 1px #ef4444;
      }
    `}
`

const ErrorMessage = styled(Text).attrs({ as: 'div', size: 'xs' })`
  margin-top: ${(props) => props.theme.spacing(2)};
`

export const TextField: FC<TextFieldProps> = ({
  children,
  className,
  controls = null,
  disabled = false,
  error = false,
  errorMessage,
  hint,
  icon,
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
      <InputWrapper>
        <StyledInput
          alignIcon={icon && icon.align}
          aria-describedby={error || hint ? `${errorId} ${hintId}` : undefined}
          aria-invalid={error}
          aria-required={required || undefined}
          disabled={disabled}
          hasError={!!error}
          id={id}
          required={required}
          type={type}
          {...inputProps}
        />
        {icon && <StyledIcon {...icon} />}
        {controls}
      </InputWrapper>
      {error && <ErrorMessage id={errorId}>{errorMessage}</ErrorMessage>}
    </Wrapper>
  )
}

export default TextField
