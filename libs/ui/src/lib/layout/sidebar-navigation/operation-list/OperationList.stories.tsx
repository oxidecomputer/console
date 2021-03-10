import React, { FC } from 'react'
import { OperationList } from './OperationList'

export default {
  component: OperationList,
  title: 'Layout/Sidebar Navigation/Operation List',
}

export const primary = () => {
  return <OperationList />
}
