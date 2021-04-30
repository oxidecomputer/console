import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

import { Text } from '../../text/Text'
import { Icon } from '../../icon/Icon'
import { Avatar } from '../../avatar/Avatar'
import { color, spacing } from '@oxide/css-helpers'

const StyledGlobalNav = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
`

const StyledIcon = styled(Icon)`
  width: ${spacing(6)};
`

const Link = styled.a`
  margin-left: ${spacing(8)};
  display: inline-flex;
`

const StyledText = styled(Text).attrs({ size: 'sm' })`
  text-transform: uppercase;
`

const encodedFillColor = encodeURI(color('gray700'))

const TickBar = styled.div`
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 20'%3E%3Cpath fill='${encodedFillColor}' d='M0 0H1.6V20H0V0Z'/%3E%3C/svg%3E%0A");
  background-position: center left;
  background-repeat: repeat-x;
  background-size: ${spacing(4, 5)};
  height: ${spacing(5)};
  width: 100%;
`

const Button = styled.button.attrs({ type: 'button' })`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.themeColors.gray100};
  display: inline-flex;
  margin-left: ${spacing(8)};
  padding: 0;

  &:hover {
    background-color: transparent;
    color: ${({ theme }) => theme.themeColors.green500};
  }
`

const FeedbackButton = styled(Button)`
  margin-left: ${spacing(10)};
  margin-right: ${spacing(2)};
`

export const GlobalNav: FC = () => {
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
