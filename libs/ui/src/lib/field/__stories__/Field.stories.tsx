import React from 'react'
import { Story } from '@storybook/react'
import { Field, FieldProps } from '../Field'

const Template: Story<FieldProps> = (args) => <Field {...args} />

export const Default = Template.bind({})
Default.args = {
  id: 'default',
  children: 'Default',
  placeholder: 'placeholder',
}

export const Email = Template.bind({})
Email.args = {
  id: 'email',
  autocomplete: 'email',
  children: 'Email Address',
  error: false,
  onChange: (event) => console.log(event.target.value),
  required: true,
}

export const EmailInvalid = Template.bind({})
EmailInvalid.args = {
  id: 'email-invalid',
  autocomplete: 'email',
  children: 'Email Address',
  error: true,
  errorMessage: 'Please enter a valid email address',
  onChange: (event) => console.log(event.target.value),
  required: true,
}
