import React from 'react'
import type { Story } from '@storybook/react'
import { Tabs, TabsProps } from '../Tabs'

const sampleProps = {
  label: 'Project View',
  tabs: ['Overview', 'Metrics', 'Activity', 'Access & IAM', 'Settings'],
  panels: [
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
  ],
}

const Template: Story<TabsProps> = (args) => <Tabs {...args} />

export const Default = Template.bind({})
Default.args = {
  ...sampleProps,
}

export const FullWidth = Template.bind({})
FullWidth.args = {
  ...sampleProps,
  fullWidth: true,
}
