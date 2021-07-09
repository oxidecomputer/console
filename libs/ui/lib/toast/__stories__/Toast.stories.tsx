import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import type { ActionToastProps, ConfirmToastProps, ToastProps } from '../Toast'
import { ConfirmToast, ActionToast, Toast } from '../Toast'
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

const ConfirmToastTemplate: Story<ConfirmToastProps> = (args) => (
  <ConfirmToast {...args} />
)
export const Confirm = ConfirmToastTemplate.bind({})
Confirm.args = {
  title: 'Receive notifications',
  content: 'Notifications may include alerts, sounds, and badges.',

  confirm: 'Allow',
  onConfirm: action('onConfirm'),

  cancel: "Don't Allow",
  onCancel: action('onCancel'),
}
