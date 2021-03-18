import React from 'react'
import { Tabs } from './Tabs'

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
        <div key={1}>Overview panel content</div>,
        <div key={2}>Metrics panel content</div>,
        <div key={3}>Activity panel content</div>,
        <div key={4}>Acess & IAM panel content</div>,
        <div key={5}>Settings panel content</div>,
      ]}
    />
  )
}
