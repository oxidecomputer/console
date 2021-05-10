import type { Meta, Story } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import React, { useState } from 'react'
import type { NumberInputGroupProps } from '..'
import { NumberInputGroup } from '..'
import mdx from './NumberInputGroup.mdx'

export default {
  title: 'Components/Forms/Input Group/Number',
  parameters: {
    docs: {
      page: mdx,
    },
  },
} as Meta<NumberInputGroupProps>

const Template: Story<NumberInputGroupProps> = (args) => (
  <NumberInputGroup {...args} />
)

export const Default = Template.bind({})
Default.args = {
  id: 'number-input-group',
  label: 'Number Input Group',
  required: false,
  value: 10,
  onChange: action('onChange'),
}

export const Disabled = Template.bind({})
Disabled.args = {
  id: 'number-input-group',
  label: 'Number Input Group (disabled)',
  required: false,
  disabled: true,
  value: 0,
}

const StateTemplate: Story<Omit<NumberInputGroupProps, 'value' | 'onChange'>> =
  (args) => {
    const [value, setValue] = useState(10)

    return <NumberInputGroup value={value} onChange={setValue} {...args} />
  }

export const WithState = StateTemplate.bind({})
WithState.args = {
  id: 'number-input-group',
  label: 'Number Input Group (with State)',
  required: false,
}
