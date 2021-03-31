import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

import { Text } from '../text/Text'
import { Icon } from '../icon/Icon'

/* eslint-disable-next-line */
export interface RadioFieldProps {
  checked?: boolean
  onChange: React.ChangeEventHandler
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
  required?: boolean
  /**
   * The value is a useful way to handle controlled radio inputs
   */
  value: string
}

const Label = styled.label`
  display: inline-flex;
`

const LabelChildren = styled.span``

const StyledIcon = styled(Icon).attrs({ align: 'left' })``

const StyledInput = styled.input`
  /* Hide from sighted users, show to screen readers */
  position: absolute !important;
  overflow: hidden !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  border: 0 !important;
  clip: rect(1px, 1px, 1px, 1px) !important;

  &:focus + ${StyledIcon} {
    outline: none;
    border-radius: 50%;
    box-shadow: 0 0 0 1px ${({ theme }) => theme.color('green400')};
  }

  &:checked + ${StyledIcon} {
    color: ${({ theme }) => theme.color('green500')};
  }
`

const ErrorMessage = styled(Text).attrs({ as: 'div', size: 'xs' })`
  margin-top: ${(props) => props.theme.spacing(2)};
`

const HintText = styled(Text).attrs({ size: 'sm' })`
  display: block;
  padding-bottom: ${({ theme }) => theme.spacing(2)};

  color: ${({ theme }) => theme.color('gray300')};
`

export const RadioField: FC<RadioFieldProps> = ({
  checked = false,
  children,
  error = false,
  errorMessage,
  hint,
  onChange,
  required = false,
  value,
}) => {
  const errorId = error ? `${value}-validation-hint` : ``
  const hintId = hint ? `${value}-hint` : ``
  const [isChecked, setChecked] = React.useState(checked)
  const handleChange = React.useCallback(
    (event) => {
      onChange && onChange(event)
      if (event.target.value === value) {
        setChecked(true)
      }
    },
    [onChange, value]
  )
  return (
    <>
      <Label>
        <StyledInput
          aria-describedby={error || hint ? `${errorId} ${hintId}` : undefined}
          aria-invalid={error}
          checked={isChecked}
          onChange={handleChange}
          required={required}
          type="radio"
          value={value}
        />
        <StyledIcon name={isChecked ? 'radioF' : 'radioE'} />
        <LabelChildren>{children}</LabelChildren>
      </Label>
      {hint && <HintText id={hintId}>{hint}</HintText>}
      {error && <ErrorMessage id={errorId}>{errorMessage}</ErrorMessage>}
    </>
  )
}
