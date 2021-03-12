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

export const EmailField = Template.bind({})
EmailField.args = {
  id: 'email',
  autocomplete: 'email',
  children: 'Email Address',
  error: false,
  onChange: (event) => console.log(event.target.value),
  required: true,
}

export const InvalidEmailField = Template.bind({})
InvalidEmailField.args = {
  id: 'email-invalid',
  autocomplete: 'email',
  children: 'Email Address',
  error: true,
  errorMessage: 'Please enter a valid email address',
  onChange: (event) => console.log(event.target.value),
  required: true,
}

export const FieldWithLeftIcon = Template.bind({})
FieldWithLeftIcon.args = {
  icon: { align: 'left', name: 'search', color: 'gray300' },
  id: 'field-left-icon',
  children: 'Search',
  error: false,
  onChange: (event) => console.log(event.target.value),
  placeholder: 'Instances, people, projects, and more',
}

export const FieldWithRightIcon = Template.bind({})
FieldWithRightIcon.args = {
  icon: {
    align: 'right',
    name: 'info',
    color: 'gray300',
  },
  id: 'field-right-icon',
  children: 'Choose a hostname',
  error: false,
  onChange: (event) => console.log(event.target.value),
  placeholder: 'Select a role',
}

export const FieldWithHint = Template.bind({})
FieldWithHint.args = {
  icon: {
    align: 'right',
    name: 'info',
    color: 'gray300',
  },
  id: 'field-hint',
  children: 'Choose a hostname',
  error: true,
  hint:
    'Choose an identifying name you will remember. Names may contain alphanumeric characters, dashes, and periods.',
  onChange: (event) => console.log(event.target.value),
  placeholder: 'Select a role',
}
