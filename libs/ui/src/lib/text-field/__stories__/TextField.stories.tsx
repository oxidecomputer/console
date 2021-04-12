import React from 'react'
import type { Story } from '@storybook/react'

import type { TextFieldProps } from '../TextField'
import { TextField } from '../TextField'
import Icon from '../../icon/Icon'

const Template: Story<TextFieldProps> = (args) => <TextField {...args} />

export const Default = Template.bind({})
Default.args = {
  id: 'default',
  children: 'Default',
  placeholder: 'placeholder',
}

export const EmailField = Template.bind({})
EmailField.args = {
  id: 'email',
  autoComplete: 'email',
  children: 'Email Address',
  error: false,
  required: true,
}

export const InvalidEmailField = Template.bind({})
InvalidEmailField.args = {
  id: 'email-invalid',
  autoComplete: 'email',
  children: 'Email Address',
  error: true,
  errorMessage: 'Please enter a valid email address',
  required: true,
}

export const DisabledField = Template.bind({})
DisabledField.args = {
  id: 'disabled-example',
  children: 'Disabled Field',
  disabled: true,
  error: false,
  required: true,
}

export const FieldWithLeftIcon = Template.bind({})
FieldWithLeftIcon.args = {
  leftAccessory: <Icon name="search" color="gray300" />,
  id: 'field-left-icon',
  children: 'Search',
  error: false,
  placeholder: 'Instances, people, projects, and more',
}

export const FieldWithRightIcon = Template.bind({})
FieldWithRightIcon.args = {
  rightAccessory: <Icon name="info" color="gray300" />,
  id: 'field-right-icon',
  children: 'Choose a hostname',
  error: false,
  hint:
    'Choose an identifying name you will remember. Names may contain alphanumeric characters, dashes, and periods.',
}

export const FieldWithHint = Template.bind({})
FieldWithHint.args = {
  rightAccessory: <Icon name="info" color="gray300" />,
  id: 'field-description',
  children: 'Add a description',
  error: false,
  hint: 'What is unique about your organization?',
}
