import React from 'react'
import 'twin.macro'

import { Avatar } from '@oxide/ui'

export const GlobalNav = () => {
  return (
    <div tw="w-full flex items-center justify-end">
      <button type="button">
        <Avatar round size="sm" name="Some User" />
      </button>
    </div>
  )
}
