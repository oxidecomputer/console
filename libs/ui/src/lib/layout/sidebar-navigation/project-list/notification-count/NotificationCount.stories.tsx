import React from 'react'
import type { NotificationCountProps } from './NotificationCount'
import { NotificationCount } from './NotificationCount'

export default {
  component: NotificationCount,
  title: 'Layout/Sidebar Navigation/Project List/Notification Count',
}

const Template = (props: NotificationCountProps) => (
  <NotificationCount {...props} />
)

export const Primary = Template.bind({})
Primary.args = { count: 2 }
