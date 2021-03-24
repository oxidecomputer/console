import React from 'react'
import type { Story } from '@storybook/react'

import type { NotificationCountProps } from './NotificationCount'
import { NotificationCount } from './NotificationCount'

export default {
  component: NotificationCount,
  title: 'Layout/Sidebar Navigation/Project List/Notification Count',
}

const Template: Story<NotificationCountProps> = (args) => (
  <NotificationCount {...args} />
)

export const Primary = Template.bind({})
Primary.args = { count: 2 }
