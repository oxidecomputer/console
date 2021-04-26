import React from 'react'
import type { Story } from '@storybook/react'
import type { ToastProps } from './Toast'
import { Toast } from './Toast'

export default {
  component: Toast,
  title: 'Toast',
}

const Template: Story<ToastProps> = (args) => <Toast {...args} />

export const Default = Template.bind({})
Default.args = {}
