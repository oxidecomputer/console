import React from 'react'

import styled from 'styled-components'
import GlobalNavigation from './global-navigation/GlobalNavigation'

/* eslint-disable-next-line */
export interface LayoutProps {}

const StyledLayout = styled.div``

export const Layout = (props: LayoutProps) => {
  return (
    <StyledLayout>
      <GlobalNavigation />
    </StyledLayout>
  )
}

export default Layout
