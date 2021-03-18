import React from 'react'
import { OperationList } from './OperationList'
import type { Story } from '@storybook/react'

export default {
  component: OperationList,
  title: 'Layout/Sidebar Navigation/Operation List',
  decorators: [
    (Story: Story) => (
      <div style={{ maxWidth: '180px' }}>
        <Story />
      </div>
    ),
  ],
}

export const primary = () => {
  return <OperationList />
}
