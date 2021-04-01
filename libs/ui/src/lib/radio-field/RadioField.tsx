import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'
import type { DefaultTheme, StyledComponentProps } from 'styled-components'

import { Text } from '../text/Text'
import { Icon } from '../icon/Icon'

export type RadioFieldProps = StyledComponentProps<
  'input',
  DefaultTheme,
  {
    /**
     * RadioGroup will handle checked based on its value
     */
    checked?: boolean
    onChange?: React.ChangeEventHandler
    /**
     * Defaults to `false`. Input is invalid
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
    /**
     * RadioGroup will pass `name` to Radio fields.
     */
    name?: string
    required?: boolean
    /**
     * The value is a useful way to handle controlled radio inputs
     */
    value: string
  },
  never
>

const INDENT = 6
const RADIO_WIDTH = 3.5

const Wrapper = styled.div`
  padding-left: ${({ theme }) => theme.spacing(INDENT)};
`

const Label = styled.label`
  align-items: center;
  display: inline-flex;
  width: 100%;
`

const LabelText = styled(Text).attrs({ size: 'sm' })`
  color: ${({ theme }) => theme.color('white')};
`

const IconWrapper = styled.span`
  margin-right: ${({ theme }) => theme.spacing(INDENT - RADIO_WIDTH)};
  margin-left: ${({ theme }) => theme.spacing(-1 * INDENT)};
`

const EmptyRadio = styled(Icon)`
  width: ${({ theme }) => theme.spacing(RADIO_WIDTH)};
`

const FilledRadio = styled(Icon)`
  width: ${({ theme }) => theme.spacing(RADIO_WIDTH)};

  color: ${({ theme }) => theme.color('green500')};
`

const StyledInput = styled.input`
  /* Hide from sighted users, show to screen readers */
  position: absolute !important;
  overflow: hidden !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  border: 0 !important;
  clip: rect(1px, 1px, 1px, 1px) !important;

  &:focus + ${IconWrapper} {
    ${EmptyRadio}, ${FilledRadio} {
      outline: none;
      border-radius: 50%;
      box-shadow: 0 0 0 1px ${({ theme }) => theme.color('green400')};
    }
  }

  &:checked + ${IconWrapper} {
    ${EmptyRadio} {
      display: none;
    }
  }

  &:not(:checked) + ${IconWrapper} {
    ${FilledRadio} {
      display: none;
    }
  }
`

const HintText = styled(Text).attrs({ size: 'sm' })`
  display: block;
  margin-top: ${({ theme }) => theme.spacing(1)};

  color: ${({ theme }) => theme.color('gray300')};
`

const ErrorMessage = styled(Text).attrs({ as: 'div', size: 'xs' })`
  margin-top: ${({ theme }) => theme.spacing(2)};
`

export const RadioField: FC<RadioFieldProps> = ({
  checked,
  children,
  error = false,
  errorMessage,
  hint,
  name,
  onChange,
  required = false,
  value,
}) => {
  const errorId = error ? `${value}-validation-hint ` : ``
  const hintId = hint ? `${value}-hint` : ``

  const handleChange = React.useCallback(
    (event) => {
      if (onChange) {
        onChange(event)
      }
    },
    [onChange]
  )
  return (
    <Wrapper>
      <Label>
        <StyledInput
          aria-describedby={error || hint ? `${errorId}${hintId}` : undefined}
          aria-invalid={error}
          checked={checked}
          name={name}
          onChange={handleChange}
          required={required}
          type="radio"
          value={value}
        />
        <IconWrapper>
          <EmptyRadio name="radioE" />
          <FilledRadio name="radioF" />
        </IconWrapper>
        <LabelText>{children}</LabelText>
      </Label>
      {hint && <HintText id={hintId}>{hint}</HintText>}
      {error && <ErrorMessage id={errorId}>{errorMessage}</ErrorMessage>}
    </Wrapper>
  )
}
