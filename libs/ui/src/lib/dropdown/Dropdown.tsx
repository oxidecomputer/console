import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

/* eslint-disable-next-line */
export interface DropdownProps {}

const StyledDropdown = styled.div`
  color: pink;
`

export const Dropdown: FC<DropdownProps> = (props) => {
  return (
    <StyledDropdown>
      <h1>Welcome to Dropdown!</h1>
    </StyledDropdown>
  )
}
