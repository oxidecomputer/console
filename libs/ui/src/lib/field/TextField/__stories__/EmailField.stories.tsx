import type { Meta, Story } from '@storybook/react'
import React from 'react'
import type { EmailFieldProps } from '../'
import { EmailField } from '../'

export default {
  title: 'Components/Fields/Email Field',
} as Meta<EmailFieldProps>

const Template: Story<EmailFieldProps> = (args) => <EmailField {...args} />

export const Default = Template.bind({})
Default.args = {
  id: 'email',
  label: 'Email Address',
  error: false,
  required: true,
}

export const Invalid = Template.bind({})
Invalid.args = {
  id: 'email-invalid',
  label: 'Email Address',
  error: true,
  errorMessage: 'Please enter a valid email address',
  required: true,
}
