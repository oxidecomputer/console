import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

import { TextField } from '../text-field/TextField'
import { Icon } from '../icon/Icon'

/* eslint-disable-next-line */
export interface NumberFieldProps {}

const StyledTextField = styled(TextField)`
  input[type='number'] {
    appearance: textfield;
  }

  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
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

  height: 100%;
  box-shadow: inset 0 0 2px yellow;
`

export const NumberField: FC<NumberFieldProps> = ({ children }) => {
  return (
    <StyledTextField
      type="number"
      pattern="[0-9]*"
      controls={
        <FieldControls>
          <button>
            <Icon name="minus" />
          </button>
          <button>
            <Icon name="plus" />
          </button>
        </FieldControls>
      }
    >
      {children}
    </StyledTextField>
  )
}
