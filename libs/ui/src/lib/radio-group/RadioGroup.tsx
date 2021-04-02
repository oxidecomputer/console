import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

/* eslint-disable-next-line */
export interface RadioGroupProps {}

const StyledRadioGroup = styled.div`
  color: pink;
`

export const RadioGroup: FC<RadioGroupProps> = (props) => {
  return (
    <StyledRadioGroup>
      <h1>Welcome to RadioGroup!</h1>
    </StyledRadioGroup>
  )
}
