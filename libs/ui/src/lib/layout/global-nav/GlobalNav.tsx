import type { FC } from 'react'
import React from 'react'

import tw, { styled, theme } from 'twin.macro'

import { Icon } from '../../icon/Icon'
import { Avatar } from '../../avatar/Avatar'

const encodedFillColor = encodeURIComponent(theme`colors.gray.700`)

const TickBar = styled.div`
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 20'%3E%3Cpath fill='${encodedFillColor}' d='M0 0H1.6V20H0V0Z'/%3E%3C/svg%3E%0A");
  background-position: center left;
  background-repeat: repeat-x;
  background-size: 1rem 1.25rem;
  ${tw`h-5 w-full`}
`

const Link = tw.a`ml-8 inline-flex`
const Icon_ = tw(Icon)`w-6!`
const Button = tw.button`inline-flex ml-8 p-0 text-gray-100 hover:text-green-500`

export const GlobalNav: FC = () => {
  return (
    <div tw="flex items-center">
      <TickBar />
      <Button type="button" tw="text-sm uppercase ml-10 mr-2">
        Feedback?
      </Button>
      <Button type="button">
        <Icon_ name="theme" />
      </Button>
      <Link href="#">
        <Icon_ name="support" />
      </Link>
      <Link href="#">
        <Icon_ name="command" />
      </Link>
      <Button type="button">
        <Icon_ name="notifications" />
      </Button>
      <Button type="button">
        <Avatar isPerson size="xs" name="Some User" />
      </Button>
    </div>
  )
}
