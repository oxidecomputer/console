import React from 'react'
import type { Story } from '@storybook/react'
import type { ToastProps } from './Toast'
import { Toast } from './Toast'

export default {
  component: Toast,
  title: 'Components/Toast',
}

const Template: Story<ToastProps> = (args) => <Toast {...args} />

export const Default = Template.bind({})
Default.args = {
  icon: 'checkO',
  title: 'Success!',
  content: '7 members have been added.',
}
