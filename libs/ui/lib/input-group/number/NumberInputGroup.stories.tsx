import type { Meta, Story } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import React, { useState } from 'react'
import type { NumberInputGroupProps } from '.'
import { NumberInputGroup } from '.'

export default {
  title: 'Components/Forms/Input Group/Number',
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
    const [value, setValue] = useState(0)

    return <NumberInputGroup value={value} onChange={setValue} {...args} />
  }

export const WithState = StateTemplate.bind({})
WithState.args = {
  id: 'number-input-group',
  label: 'Number Input Group (with state)',
  required: false,
}

export const WithStateMaxMin = StateTemplate.bind({})
WithStateMaxMin.args = {
  id: 'number-input-group',
  label: 'Number Input Group (with state, max, and min)',
  required: false,
  max: 10,
  min: -10,
}
