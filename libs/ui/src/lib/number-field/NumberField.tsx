import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

import { TextField } from '../text-field/TextField'
import { Icon } from '../icon/Icon'

/* eslint-disable-next-line */
export interface NumberFieldProps {}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
`

export const NumberField: FC<NumberFieldProps> = ({ children }) => {
  return (
    <Wrapper>
      <TextField type="number" pattern="[0-9]*">
        {children}
      </TextField>
      <button>-</button>
      <button>
        <Icon name="plus" />
      </button>
    </Wrapper>
  )
}
