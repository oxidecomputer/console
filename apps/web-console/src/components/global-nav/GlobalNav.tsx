import React from 'react'

import tw from 'twin.macro'

import { Avatar } from '@oxide/ui'

const Button = tw.button`inline-flex ml-8 p-0 text-gray-100 hover:text-green-500`

export const GlobalNav = () => {
  return (
    <div tw="w-full flex items-center justify-end">
      <Button type="button">
        <Avatar round size="sm" name="Some User" />
      </Button>
    </div>
  )
}
