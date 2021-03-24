import React from 'react'
import type { Story } from '@storybook/react'
import type { TabsProps } from '../Tabs'
import { Tabs } from '../Tabs'

const sampleProps = {
  label: 'Project View',
  tabs: ['Overview', 'Metrics', 'Activity', 'Access & IAM', 'Settings'],
  children: [
    <div key={1}>Overview panel content</div>,
    <div key={2}>Metrics panel content</div>,
    <div key={3}>Activity panel content</div>,
    <div key={4}>Acess & IAM panel content</div>,
    <div key={5}>Settings panel content</div>,
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
