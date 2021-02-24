import React from 'react'
import styled from 'styled-components'

import { Text } from '../../text/Text'

/* eslint-disable-next-line */
export interface SidebarNavigationProps {}

const StyledSidebarNavigation = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
  max-width: ${({ theme }) => theme.spacing(55)};
  height: 100%;

  // TODO: Fix with proper color
  background-color: ${({ theme }) => theme.themeColors.gray800};
`

const StyledLogo = styled(Text).attrs({ size: '3xl' })`
  color: ${({ theme }) => theme.themeColors.green600};
`

export const SidebarNavigation = (props: SidebarNavigationProps) => {
  return (
    <StyledSidebarNavigation {...props}>
      <StyledLogo>Oxide</StyledLogo>
    </StyledSidebarNavigation>
  )
}

export default SidebarNavigation
