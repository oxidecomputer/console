import React from 'react'
import type { Story } from '@storybook/react'
import type { NumberFieldProps } from '../NumberField'
import { NumberField } from '../NumberField'

const Template: Story<NumberFieldProps> = (args) => <NumberField {...args} />

export const Default = Template.bind({})
Default.args = {
  children: 'label',
  id: 'default',
}
