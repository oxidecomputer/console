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
        <div key={1}>Overview panel</div>,
        <div key={2}>Metrics panel</div>,
        <div key={3}>Activity panel</div>,
        <div key={4}>Acess & IAM panel</div>,
        <div key={5}>Settings panel</div>,
      ]}
    />
  )
}
