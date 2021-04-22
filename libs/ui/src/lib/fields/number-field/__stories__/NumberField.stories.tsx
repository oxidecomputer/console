import type { Meta, Story } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import React, { useState } from 'react'
import type { NumberFieldProps } from '..'
import { NumberField } from '..'
import mdx from './NumberField.mdx'

export default {
  title: 'Components/Fields/Number Field',
  parameters: {
    docs: {
      page: mdx,
    },
  },
} as Meta<NumberFieldProps>

const Template: Story<NumberFieldProps> = (args) => <NumberField {...args} />

export const Default = Template.bind({})
Default.args = {
  id: 'number-field',
  label: 'Number Field',
  required: false,
  value: 10,
  onChange: action('onChange'),
}

const StateTemplate: Story<Omit<NumberFieldProps, 'value' | 'onChange'>> = (
  args
) => {
  const [value, setValue] = useState(10)

  return <NumberField value={value} onChange={setValue} {...args} />
}
export const WithState = StateTemplate.bind({})
WithState.args = {
  id: 'number-field',
  label: 'Number Field',
  required: false,
}
