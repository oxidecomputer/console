import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

import { Text } from '../../text/Text'
import { Icon } from '../../icon/Icon'
import { Avatar } from '../../avatar/Avatar'

/* eslint-disable-next-line */
export interface GlobalNavProps {}

const StyledGlobalNav = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
  justify-content: right;
`

const StyledIcon = styled(Icon)`
  width: ${({ theme }) => theme.spacing(7)};
`

const Link = styled.a`
  margin-left: ${({ theme }) => theme.spacing(8)};
  display: inline-flex;
`

const StyledText = styled(Text).attrs({
  size: 'sm',
  font: 'mono',
  weight: 400,
})`
  text-transform: uppercase;
`

const TickBar = styled.div`
  // placeholder: url-encoded contents of warning-filled.svg
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' role='img' aria-labelledby='icon-warning-filled'%3E%3Ctitle id='icon-warning-filled'%3EWarning%3C/title%3E%3Cpath fill='gray' fill-rule='evenodd' clip-rule='evenodd' d='M0 19.75L10 .25l10 19.5H0zM11 14V6.5H9V14h2zm0 3.5v-2H9v2h2z'/%3E%3C/svg%3E%0A");
  background-position: center right;
  background-repeat: repeat-x;
  background-size: ${({ theme }) => theme.spacing(5)};
  height: ${({ theme }) => theme.spacing(5)};
  width: 100%;
`

const Button = styled.button.attrs({ type: 'button' })`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.themeColors.gray100};
  display: inline-flex;
  margin-left: ${({ theme }) => theme.spacing(8)};
  padding: 0;

  &:hover {
    background-color: transparent;
    color: ${({ theme }) => theme.themeColors.green500};
  }
`

const FeedbackButton = styled(Button)`
  margin-left: ${({ theme }) => theme.spacing(10)};
  margin-right: ${({ theme }) => theme.spacing(2)};
`

export const GlobalNav: FC<GlobalNavProps> = () => {
  return (
    <StyledGlobalNav>
      <TickBar />
      <FeedbackButton>
        <StyledText>Feedback?</StyledText>
      </FeedbackButton>
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
        <Avatar isPerson size="sm" name="Some User" />
      </Button>
    </StyledGlobalNav>
  )
}
