import React from 'react'

import styled from 'styled-components'
import GlobalNavigation from './global-navigation/GlobalNavigation'
import SidebarNavigation from './sidebar-navigation/SidebarNavigation'

/* eslint-disable-next-line */
export interface LayoutProps {}

const StyledLayout = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`

const StyledSidebarNavigation = styled(SidebarNavigation)`
  flex: ${({ theme }) => theme.spacing(55)};
`

const StyledGlobalNavigation = styled(GlobalNavigation)``

const Container = styled.div`
  flex: 1;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(8)};
`

const Main = styled.div`
  height: ${({ theme }) => theme.spacing(128)};
`

export const Layout = (props: LayoutProps) => {
  return (
    <StyledLayout>
      <StyledSidebarNavigation />
      <Container>
        <StyledGlobalNavigation />
        <Main />
      </Container>
    </StyledLayout>
  )
}

export default Layout
