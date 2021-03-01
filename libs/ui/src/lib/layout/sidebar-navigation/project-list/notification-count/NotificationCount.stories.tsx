import React from 'react'
import { NotificationCount } from './NotificationCount'

export default {
  component: NotificationCount,
  title: 'Layout/Sidebar Navigation/Project List/Notification Count',
}

export const primary = () => {
  return <NotificationCount count={2} />
}
