import React from 'react'
import { OperationList } from './OperationList'
import type { Meta } from '@storybook/react'

export default {
  component: OperationList,
  title: 'Layout/Sidebar Navigation/Operation List',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '180px' }}>
        <Story />
      </div>
    ),
  ],
} as Meta

export const primary = () => {
  return <OperationList />
}
