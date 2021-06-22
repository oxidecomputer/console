import type { FC } from 'react'
import React from 'react'
import 'twin.macro'

/* eslint-disable-next-line */
export interface NotificationCountProps {
  count: number
}

export const NotificationCount: FC<NotificationCountProps> = ({ count }) => (
  <div tw="inline-flex justify-center px-1 bg-yellow rounded-full">
    <span tw="text-xs relative bottom-px text-yellow-tint">{count}</span>
  </div>
)

export default NotificationCount
