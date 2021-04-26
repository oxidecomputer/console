import type { Meta, Story } from '@storybook/react'
import React from 'react'
import type { InputGroupProps } from '..'
import { InputGroup, Input } from '..'
import Icon from '../../icon/Icon'

export default {
  title: 'Components/Input Group/Custom Input Groups',
} as Meta<InputGroupProps>

const Template: Story<InputGroupProps> = (args) => (
  <InputGroup {...args}>
    <div style={{ padding: '0 0.5rem', alignSelf: 'center' }}>
      <Icon name="info" color="gray300" />
    </div>
    <Input />
  </InputGroup>
)
export const Default = Template.bind({})
Default.args = {
  label: 'Custom Field',
  required: false,
  hint: '',
  error: '',
}
