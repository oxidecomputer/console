import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import type { TextFieldProps } from '..'
import { TextField } from '..'
import Icon from '../../../icon/Icon'

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

export const Controlled = Template.bind({})
Controlled.args = {
  ...Default.args,
  value: '',
  onChange: action('onChange'),
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

export const WithInfo = Template.bind({})
WithInfo.args = {
  id: 'with-info',
  label: 'Text Field with extra info',
  info: 'Hello, World!',
}

export const CustomLabel = Template.bind({})
CustomLabel.args = {
  id: 'custom-label',
  label: (
    <>
      <div style={{ paddingRight: '.5rem' }}>
        <Icon name="users" color="gray300" />
      </div>
      Custom Label
    </>
  ),
}
