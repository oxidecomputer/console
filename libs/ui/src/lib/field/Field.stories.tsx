import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Field, FieldProps } from './Field'

export default {
  component: Field,
  title: 'Components/Form/Field',
} as Meta

const Template: Story<FieldProps> = (args) => <Field {...args} />

export const Default = Template.bind({})
Default.args = {
  id: 'default',
  children: 'Default',
  error: false,
}

export const Email = Template.bind({})
Email.args = {
  id: 'email',
  autocomplete: 'email',
  children: 'Email Address',
  error: false,
  required: true,
}

export const EmailInvalid = Template.bind({})
EmailInvalid.args = {
  id: 'email',
  autocomplete: 'email',
  children: 'Email Address',
  error: true,
  errorMessage: 'Please enter a valid email address',
  required: true,
}
