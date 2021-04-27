import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import type { ActionToastProps, ToastProps } from '../Toast'
import { ActionToast } from '../Toast'
import { Toast } from '../Toast'
import mdx from './Toast.mdx'

export default {
  component: Toast,
  title: 'Components/Toast',
  parameters: {
    docs: {
      page: mdx,
    },
  },
} as Meta<ToastProps>

const Template: Story<ToastProps> = (args) => <Toast {...args} />

export const Default = Template.bind({})
Default.args = {
  icon: 'checkO',
  title: 'Success!',
  content: '7 members have been added.',
}

const ActionToastTemplate: Story<ActionToastProps> = (args) => (
  <ActionToast {...args} />
)
export const Action = ActionToastTemplate.bind({})
Action.args = {
  title: 'Project archived',
  action: 'Undo',
  onAction: action('onAction'),
}
