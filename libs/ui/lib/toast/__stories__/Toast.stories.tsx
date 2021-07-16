import React from 'react'
import type { Story } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import type { ToastProps } from '../Toast'
import { Toast } from '../Toast'

const Template: Story<ToastProps> = (args) => <Toast {...args} />

export const Default = Template.bind({})
Default.args = {
  icon: 'checkO',
  variant: 'success',
  title: 'Success!',
  content: '7 members have been added.',
  onClose: action('onClose'),
}
