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
        <div key={1} style={{ marginTop: '1rem' }}>
          Overview panel content
        </div>,
        <div key={2} style={{ marginTop: '1rem' }}>
          Metrics panel content
        </div>,
        <div key={3} style={{ marginTop: '1rem' }}>
          Activity panel content
        </div>,
        <div key={4} style={{ marginTop: '1rem' }}>
          Acess & IAM panel content
        </div>,
        <div key={5} style={{ marginTop: '1rem' }}>
          Settings panel content
        </div>,
      ]}
    />
  )
}
