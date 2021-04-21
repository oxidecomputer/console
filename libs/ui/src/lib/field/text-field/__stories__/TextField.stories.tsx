import React from 'react'
import type { Meta, Story } from '@storybook/react'
import type { TextFieldProps } from '..'
import { TextField } from '..'

export default {
  title: 'Components/Fields/Text Field',
} as Meta<TextFieldProps>

const Template: Story<TextFieldProps> = (args) => <TextField {...args} />

export const Default = Template.bind({})
Default.args = {
  id: 'default',
  label: 'Default',
  placeholder: 'placeholder',
  info: '',
  error: '',
}

export const Invalid = Template.bind({})
Invalid.args = {
  id: 'invalid',
  label: 'Invalid Field',
  error: 'Field is invalid, please fix',
}

export const Disabled = Template.bind({})
Disabled.args = {
  id: 'disabled',
  label: 'Disabled Field',
  disabled: true,
}

export const WithHint = Template.bind({})
WithHint.args = {
  id: 'with-hint',
  label: 'Text Field with Hint',
  hint: 'This is a hint about the text field',
}
