import React from 'react'
import type { Story } from '@storybook/react'

import type { RadioFieldProps } from '../RadioField'
import { RadioField } from '../RadioField'
import { Text } from '../../text/Text'

export default {
  component: RadioField,
  title: 'Components/RadioField',
}

const Template: Story<RadioFieldProps> = (args) => <RadioField {...args} />

export const Default = Template.bind({})
Default.args = {
  value: 'custom',
  children: (
    <Text color="white" size="sm">
      Automatically format and mount
    </Text>
  ),
  hint: 'Some details about automatically formatting and mounting disks.',
}

export const Checked = Template.bind({})
Checked.args = {
  checked: true,
  value: 'is-checked',
  children: (
    <Text color="white" size="sm">
      Automatically format and mount
    </Text>
  ),
  hint: 'Some details about automatically formatting and mounting disks.',
}
