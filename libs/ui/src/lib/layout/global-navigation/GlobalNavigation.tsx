import React from 'react'

import styled from 'styled-components'
import Icon from '../../icon/Icon'
import Text from '../../text/Text'

/* eslint-disable-next-line */
export interface GlobalNavigationProps {}

const StyledGlobalNavigation = styled.div`
  padding: ${({ theme }) => theme.spacing(2)} 0;

  display: flex;
  flex-direction: row;

  justify-content: flex-end;
  align-items: center;

  // TODO: Fix with proper color
  background-color: ${({ theme }) => theme.themeColors.gray900};

  ${({ theme }) => theme.spaceBetweenX(8)}
`

const Link = styled(Text)`
  color: white;
`

const StyledIcon = styled(Icon).attrs({ color: 'white' })``

export const GlobalNavigation = (props: GlobalNavigationProps) => {
  return (
    <StyledGlobalNavigation {...props}>
      <Link>Feedback?</Link>
      <StyledIcon name="theme" />
      <StyledIcon name="support" />
      <StyledIcon name="command" />
      <Link>Notifications</Link>
      <Link>Avatar</Link>
    </StyledGlobalNavigation>
  )
}

export default GlobalNavigation
