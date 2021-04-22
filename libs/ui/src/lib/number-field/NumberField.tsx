import type { ChangeEventHandler, FC } from 'react'
import React from 'react'

import styled from 'styled-components'

import type { TextFieldProps } from '../text-field/TextField'
import { TextField } from '../text-field/TextField'
import { Icon } from '../icon/Icon'
export interface NumberFieldProps extends TextFieldProps {
  handleChange: (newValue: number) => void
  value: number
}

// The input type='number' comes with built in increment/decrement controls that we
// hide here so we can render our own instead. for more, see NumberField.stories.mdx
const StyledTextField = styled(TextField)`
  [type='number'] {
    appearance: textfield;
  }

  [type='number']::-webkit-inner-spin-button,
  [type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

const FieldControls = styled.div`
  display: flex;
  flex-direction: row;
`

const Control = styled.button`
  flex: 0 0 auto;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color('green500')};
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.color('green500')};
  }

  &:hover {
    background-color: ${({ theme }) => theme.color('gray800')};
  }
`

export const NumberField: FC<NumberFieldProps> = ({
  children,
  handleChange,
  value,
  ...rest
}) => {
  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.target.value === '') {
      handleChange(0)
    } else {
      const next = parseInt(event.target.value)
      // the number `e` passes the `type="number"` validation
      // so only call change handler if `parseInt` returns a number
      if (!Number.isNaN(next)) {
        handleChange(next)
      }
    }
  }
  const onDecrement = () => handleChange(value - 1)
  const onIncrement = () => handleChange(value + 1)
  return (
    <StyledTextField
      type="number"
      onChange={onChange}
      pattern="[0-9]*"
      value={value}
      {...rest}
      rightAccessory={
        <FieldControls>
          <Control onClick={onDecrement}>
            <Icon name="minus" svgProps={{ title: 'Decrement' }} />
          </Control>
          <Control onClick={onIncrement}>
            <Icon name="plus" svgProps={{ title: 'Increment' }} />
          </Control>
        </FieldControls>
      }
    >
      {children}
    </StyledTextField>
  )
}
