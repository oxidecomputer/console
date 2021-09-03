import type { Meta, Story } from '@storybook/react'
import React from 'react'
import type { InputGroupProps } from '..'
import { InputGroup, Input } from '..'
import { Icon } from '../../icon/Icon'

export default {
  title: 'Components/Forms/Input Group/Custom Input Groups',
} as Meta<InputGroupProps>

const Template: Story<InputGroupProps> = (args) => (
  <InputGroup {...args}>
    <div className="px-2 self-center">
      <Icon name="info" className="text-gray-50" />
    </div>
    <Input />
  </InputGroup>
)
export const Default = Template.bind({})
Default.args = {
  label: 'Custom Field',
  hint: '',
  error: '',
}
