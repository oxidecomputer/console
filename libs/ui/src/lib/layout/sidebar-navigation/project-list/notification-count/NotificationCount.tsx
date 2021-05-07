import type { FC } from 'react'
import React from 'react'
import 'twin.macro'

/* eslint-disable-next-line */
export interface NotificationCountProps {
  count: number
}

export const NotificationCount: FC<NotificationCountProps> = ({ count }) => (
  <div tw="inline-flex justify-center px-1 bg-yellow-500 rounded-full">
    <span tw="text-xs relative bottom-px text-yellow-900">{count}</span>
  </div>
)

export default NotificationCount
