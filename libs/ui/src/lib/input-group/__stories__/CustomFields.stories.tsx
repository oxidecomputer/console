import type { Meta, Story } from '@storybook/react'
import React from 'react'
import type { InputGroupProps } from '..'
import { InputGroup, Input } from '..'
import { Icon } from '../../icon/Icon'
import 'twin.macro'

export default {
  title: 'Components/Forms/Input Group/Custom Input Groups',
} as Meta<InputGroupProps>

const Template: Story<InputGroupProps> = (args) => (
  <InputGroup {...args}>
    <div style={{ padding: '0 0.5rem', alignSelf: 'center' }}>
      <Icon name="info" tw="text-gray-50" />
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
