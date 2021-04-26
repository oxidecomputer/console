import type { Meta, Story } from '@storybook/react'
import React from 'react'
import type { FieldProps } from '..'
import { Field, Input } from '..'
import Icon from '../../icon/Icon'

export default {
  title: 'Components/Fields/Custom Fields',
} as Meta<FieldProps>

const Template: Story<FieldProps> = (args) => (
  <Field {...args}>
    <div style={{ padding: '0 0.5rem', alignSelf: 'center' }}>
      <Icon name="info" color="gray300" />
    </div>
    <Input />
  </Field>
)
export const Default = Template.bind({})
Default.args = {
  label: 'Custom Field',
  required: false,
  hint: '',
  error: '',
}
