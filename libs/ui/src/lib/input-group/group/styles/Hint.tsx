import type { FC } from 'react'
import React from 'react'
import 'twin.macro'

export const Hint: FC<{ id: string }> = ({ id, children }) => (
  <div id={id} tw="flex-1 pb-2 text-gray-300">
    <span tw="text-sm font-medium">{children}</span>
  </div>
)
