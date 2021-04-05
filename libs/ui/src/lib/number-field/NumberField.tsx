import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

import { TextField } from '../text-field/TextField'
import { Icon } from '../icon/Icon'

/* eslint-disable-next-line */
export interface NumberFieldProps {}

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

const BOX_SHADOW_SIZE = '2px'
const FieldControls = styled.div`
  position: absolute;
  top: ${BOX_SHADOW_SIZE};
  right: ${BOX_SHADOW_SIZE};
  bottom: ${BOX_SHADOW_SIZE};
`

const Control = styled.button`
  height: 100%;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color('green500')};
    box-shadow: 0px 0px 0px 1px ${({ theme }) => theme.color('green500')};
  }
`

export const NumberField: FC<NumberFieldProps> = ({ children }) => {
  const [value, setValue] = React.useState(0)
  const handleChange = React.useCallback(
    (event) => {
      setValue(event.target.value)
    },
    [setValue]
  )
  const handleIncrement = () => setValue(value + 1)
  const handleDecrement = () => setValue(value - 1)
  return (
    <StyledTextField
      type="number"
      pattern="[0-9]*"
      onChange={handleChange}
      value={value}
      controls={
        <FieldControls>
          <Control onClick={handleDecrement}>
            <Icon name="minus" />
          </Control>
          <Control onClick={handleIncrement}>
            <Icon name="plus" />
          </Control>
        </FieldControls>
      }
    >
      {children}
    </StyledTextField>
  )
}
