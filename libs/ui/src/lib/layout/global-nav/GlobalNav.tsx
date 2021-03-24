import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

import { Text } from '../../text/Text'
import { Icon } from '../../icon/Icon'
import { Avatar } from '../../avatar/Avatar'

const StyledGlobalNav = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
  justify-content: right;
`

const StyledIcon = styled(Icon)`
  width: ${({ theme }) => theme.spacing(6)};
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
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='6 0 16 26'%3E%3Cpath fill='%233F3F46' fill-rule='evenodd' clip-rule='evenodd' d='M7.014 2.74h1.98v20.68h-1.98V2.74z'/%3E%3C/svg%3E%0A");
  background-position: center left;
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
        <Avatar isPerson size="xs" name="Some User" />
      </Button>
    </StyledGlobalNav>
  )
}
