import type { FC, ReactEventHandler } from 'react'
import React from 'react'

import styled from 'styled-components'
import type { DefaultTheme, StyledComponentProps } from 'styled-components'

import { TextField } from '../text-field/TextField'
import { Icon } from '../icon/Icon'

export type NumberFieldProps = StyledComponentProps<
  'input',
  DefaultTheme,
  {
    /**
     * Starting number
     */
    defaultValue?: number
    onChange?: ReactEventHandler
    onDecrement?: ReactEventHandler
    onIncrement?: ReactEventHandler
    value?: number
  },
  never
>

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
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.color('green500')};
  }

  &:hover {
    background-color: ${({ theme }) => theme.color('gray800')};
  }
`

export const NumberField: FC<NumberFieldProps> = ({
  children,
  onChange,
  onDecrement,
  onIncrement,
  value,
}) => {
  return (
    <StyledTextField
      type="number"
      pattern="[0-9]*"
      onChange={onChange}
      value={value}
      controls={
        <FieldControls>
          <Control onClick={onDecrement}>
            <Icon name="minus" />
          </Control>
          <Control onClick={onIncrement}>
            <Icon name="plus" />
          </Control>
        </FieldControls>
      }
    >
      {children}
    </StyledTextField>
  )
}
