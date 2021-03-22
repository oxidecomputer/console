import React, { FC } from 'react'

import tw, { styled } from 'twin.macro'

import { Icon } from '../../icon/Icon'

const TickBar = styled.div`
  // placeholder: url-encoded contents of warning-filled.svg
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' role='img' aria-labelledby='icon-warning-filled'%3E%3Ctitle id='icon-warning-filled'%3EWarning%3C/title%3E%3Cpath fill='gray' fill-rule='evenodd' clip-rule='evenodd' d='M0 19.75L10 .25l10 19.5H0zM11 14V6.5H9V14h2zm0 3.5v-2H9v2h2z'/%3E%3C/svg%3E%0A");
  background-size: ${({ theme }) => theme.spacing(5)};
  ${tw`h-5 w-full bg-right bg-repeat-x`}
`

const Link = tw.a`ml-6 inline-flex font-mono text-sm uppercase`

const Button = styled.button.attrs({ type: 'button' })`
  ${tw`border-0 inline-flex ml-6 p-0 hover:text-green-500`}
`

const StyledIcon = styled(Icon)`
  ${tw`w-6`}
`

export const GlobalNav: FC = () => {
  return (
    <div tw="flex w-full h-14 items-center py-4 px-6">
      <TickBar />
      <Link href="#" tw="ml-10 mr-4">
        Feedback?
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
    </div>
  )
}
