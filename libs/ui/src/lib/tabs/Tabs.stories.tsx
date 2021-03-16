import React, { FC } from 'react'
import { Tabs, TabsProps } from './Tabs'

export default {
  title: 'Components/Tabs',
  component: Tabs,
}

export const primary = () => {
  /* eslint-disable-next-line */
  const props: TabsProps = {}

  return (
    <Tabs
      tabs={['Overview', 'Metrics', 'Activity', 'Access & IAM', 'Settings']}
    />
  )
}
