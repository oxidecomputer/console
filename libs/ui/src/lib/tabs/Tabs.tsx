import React, { FC } from 'react'

import styled from 'styled-components'

/* eslint-disable-next-line */
export interface TabsProps {}

const StyledTabs = styled.div`
  color: pink;
`

export const Tabs: FC<TabsProps> = (props) => {
  return (
    <StyledTabs>
      <h1>Welcome to Tabs!</h1>
    </StyledTabs>
  )
}

export default Tabs
