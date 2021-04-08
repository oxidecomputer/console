import React, { createRef } from 'react'
import type { FC } from 'react'
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
    icon?: { align?: 'left' | 'right' } & IconProps
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

interface InputWrapperProps {
  hasError?: boolean
  align?: 'left' | 'right'
}
const InputWrapper = styled.div<InputWrapperProps>`
  display: flex;
  flex-direction: ${({ align }) =>
    align && align === 'right' ? 'row' : 'row-reverse'};
  flex-wrap: nowrap;
  align-items: center;

  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};

  background-color: ${({ theme }) => theme.color('gray700')};

  &:hover:not([disabled]) {
    background-color: ${({ theme }) => theme.color('gray800')};
  }

  :focus-within {
    border-color: ${({ theme }) => theme.color('green500')};
    box-shadow: 0px 0px 0px 1px ${({ theme }) => theme.color('green500')};
  }

  ${({ hasError, theme }) =>
    hasError &&
    css`
      border: 1px solid ${theme.color('red500')};

      &:focus {
        border: 1px solid ${theme.color('red500')};
        box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05), 0px 0px 0px 1px #ef4444;
      }
    `}

  ${({ theme, align }) => align && theme.spaceBetweenX(2, align === 'left')}
`

const StyledIcon = styled(Icon)`
  flex: 0 0 auto;

  width: ${({ theme }) => theme.spacing(5)};
`

const StyledInput = styled.input`
  flex: 1;
  margin: 0;

  border: 1px solid transparent;
  background-color: transparent;
  color: ${({ theme }) => theme.color('gray100')};
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: ${({ theme }) => theme.spacing(3.5)};
  line-height: ${1.25 / 0.875};

  :focus {
    outline: none;
  }
`

const ErrorMessage = styled(Text).attrs({ as: 'div', size: 'xs' })`
  margin-top: ${(props) => props.theme.spacing(2)};
`

export const TextField: FC<TextFieldProps> = ({
  children,
  disabled = false,
  error = false,
  errorMessage,
  hint,
  icon,
  id,
  required = false,
  type = 'text',
  className,
  ...inputProps
}) => {
  const errorId = error ? `${id}-validation-hint` : ``
  const hintId = hint ? `${id}-hint` : ``
  const inputRef = createRef<HTMLInputElement>()

  return (
    <Wrapper disabled={disabled} className={className}>
      <Label htmlFor={id}>
        {children}
        {!required && <OptionalText>Optional</OptionalText>}
      </Label>
      {hint && <HintText id={hintId}>{hint}</HintText>}
      <InputWrapper
        hasError={!!error}
        align={icon && icon.align}
        onClick={() => {
          inputRef.current?.focus()
        }}
      >
        <StyledInput
          ref={inputRef}
          aria-invalid={error}
          type={type}
          aria-describedby={error || hint ? `${errorId} ${hintId}` : undefined}
          required={required}
          aria-required={required || undefined}
          id={id}
          disabled={disabled}
          {...inputProps}
        />
        {icon && <StyledIcon {...icon} />}
      </InputWrapper>
      {error && <ErrorMessage id={errorId}>{errorMessage}</ErrorMessage>}
    </Wrapper>
  )
}

export default TextField
