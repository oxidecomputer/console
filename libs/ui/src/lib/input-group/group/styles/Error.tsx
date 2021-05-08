import type { FC } from 'react'
import React from 'react'
import 'twin.macro'

export const ErrorMessage: FC<{ id: string }> = ({ id, children }) => (
  <div id={id} tw="mt-2">
    <span tw="text-xs">{children}</span>
  </div>
)
