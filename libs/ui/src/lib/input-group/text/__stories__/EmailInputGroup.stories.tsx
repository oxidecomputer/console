import type { Meta, Story } from '@storybook/react'
import React from 'react'
import type { EmailInputGroupProps } from '..'
import { EmailInputGroup } from '..'

export default {
  title: 'Components/Fields/Email Field',
} as Meta<EmailInputGroupProps>

const Template: Story<EmailInputGroupProps> = (args) => (
  <EmailInputGroup {...args} />
)

export const Default = Template.bind({})
Default.args = {
  id: 'email',
  label: 'Email Address',
  error: '',
  required: true,
}

export const Invalid = Template.bind({})
Invalid.args = {
  id: 'email-invalid',
  label: 'Email Address',
  error: 'Please enter a valid email address',
  required: true,
}
