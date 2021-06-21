import React from 'react'

import tw from 'twin.macro'

import { Avatar, Icon } from '@oxide/ui'

const Link = tw.a`ml-8 inline-flex`
const Icon_ = tw(Icon)`w-6!`
const Button = tw.button`inline-flex ml-8 p-0 text-gray-100 hover:text-green`

export const GlobalNav = () => {
  return (
    <div tw="w-full flex items-center justify-end">
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
        <Avatar round size="xs" name="Some User" />
      </Button>
    </div>
  )
}
