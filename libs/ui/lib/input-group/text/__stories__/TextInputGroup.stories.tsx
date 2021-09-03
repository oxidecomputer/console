import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import type { TextInputGroupProps } from '..'
import { TextInputGroup } from '..'
import { Icon } from '../../../icon/Icon'

export default {
  title: 'Components/Forms/Input Group/Text Input Group',
} as Meta<TextInputGroupProps>

const Template: Story<TextInputGroupProps> = (args) => (
  <TextInputGroup {...args} />
)

export const Default = Template.bind({})
Default.args = {
  id: 'default',
  label: 'Default',
  placeholder: 'placeholder',
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

export const CustomLabel = Template.bind({})
CustomLabel.args = {
  id: 'custom-label',
  label: (
    <>
      <div style={{ paddingRight: '.5rem' }}>
        <Icon name="users" className="text-gray-50" />
      </div>
      Custom Label
    </>
  ),
}
