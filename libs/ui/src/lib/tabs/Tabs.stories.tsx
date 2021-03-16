import React, { FC } from 'react'
import { Tabs, TabsProps } from './Tabs'

export default {
  title: 'Components/Tabs',
  component: Tabs,
}

export const primary = () => {
  return (
    <Tabs
      label="Project View"
      tabs={['Overview', 'Metrics', 'Activity', 'Access & IAM', 'Settings']}
      panels={[
        <div>Overview panel</div>,
        <div>Metrics panel</div>,
        <div>Activity panel</div>,
        <div>Acess & IAM panel</div>,
        <div>Settings panel</div>,
      ]}
    />
  )
}
