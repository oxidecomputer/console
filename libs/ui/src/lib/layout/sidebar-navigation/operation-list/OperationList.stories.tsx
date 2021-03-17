import React from 'react'
import { OperationList } from './OperationList'

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
}

export const primary = () => {
  return <OperationList />
}
