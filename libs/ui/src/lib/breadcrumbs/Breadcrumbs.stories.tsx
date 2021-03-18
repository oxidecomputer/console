import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Breadcrumbs, BreadcrumbsProps } from './Breadcrumbs'

// Follow https://github.com/storybookjs/storybook/issues/12078
// for allowing better controls for objects
export default {
  component: Breadcrumbs,
  title: 'Components/Breadcrumbs',
  argTypes: {
    data: {
      control: { type: 'object' },
    },
  },
} as Meta

const Template: Story<BreadcrumbsProps> = (args) => <Breadcrumbs {...args} />

export const Default = Template.bind({})
Default.args = {
  data: [
    { href: '/', label: 'Home' },
    { href: '/first', label: 'First page' },
    { href: '/second', label: 'Second page' },
    { label: 'Third page' },
  ],
}
