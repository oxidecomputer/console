import React, { FC } from 'react'

import styled from 'styled-components'

import { Text } from '../../text/Text'
import { Icon } from '../../icon/Icon'

/* eslint-disable-next-line */
export interface GlobalNavProps {}

const StyledGlobalNav = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.color('gray800')};
  display: flex;
  width: 100%;
  height: 56px;
  justify-content: right;
  ${({ theme }) => theme.paddingY(4)}
  ${({ theme }) => theme.paddingX(6)}
`

const StyledIcon = styled(Icon)`
  height: 1.5rem;
  width: 1.5rem;
`

const Link = styled.a`
  margin-left: ${({ theme }) => theme.spacing(6)};
  display: inline-flex;
`

const StyledText = styled(Text).attrs({
  size: 'sm',
  font: 'mono',
  weight: 400,
})`
  text-transform: uppercase;
  margin-left: ${({ theme }) => theme.spacing(8)};
  margin-right: ${({ theme }) => theme.spacing(5)};
`

const TickBar = styled.div`
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' role='img' aria-labelledby='icon-warning-filled'%3E%3Ctitle id='icon-warning-filled'%3EWarning%3C/title%3E%3Cpath fill='gray' fill-rule='evenodd' clip-rule='evenodd' d='M0 19.75L10 .25l10 19.5H0zM11 14V6.5H9V14h2zm0 3.5v-2H9v2h2z'/%3E%3C/svg%3E%0A");
  background-position: center right;
  background-repeat: repeat-x;
  background-size: 20px;
  width: 100%;
  height: 20px;
`

const Button = styled.button`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.themeColors.gray100};
  display: inline-flex;
  margin-left: ${({ theme }) => theme.spacing(6)};
  padding: 0;

  &:hover {
    background-color: transparent;
    color: ${({ theme }) => theme.themeColors.green500};
  }
`

export const GlobalNav: FC<GlobalNavProps> = () => {
  return (
    <StyledGlobalNav>
      <TickBar />
      <Link href="#">
        <StyledText>Feedback?</StyledText>
      </Link>
      <Button>
        <StyledIcon name="theme" />
      </Button>
      <Link href="#">
        <StyledIcon name="support" />
      </Link>
      <Link href="#">
        <StyledIcon name="command" />
      </Link>
      <Button>
        <StyledIcon name="notifications" />
      </Button>
      <Button>
        {/* placeholder for profile photo? where would we get that */}
        <StyledIcon name="profile" />
      </Button>
    </StyledGlobalNav>
  )
}
