import React from 'react'
import type { Story } from '@storybook/react'

import type { RadioFieldProps } from '../RadioField'
import { RadioField } from '../RadioField'
import { Text } from '../../text/Text'

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
  name: 'group',
  value: 'is-checked',
  children: (
    <Text color="white" size="sm">
      Automatically format and mount
    </Text>
  ),
}

export const withHint = Template.bind({})
withHint.args = {
  name: 'group',
  value: 'with-hint',
  children: (
    <Text color="white" size="sm">
      Automatically format and mount
    </Text>
  ),
  hint: 'Some details about automatically formatting and mounting disks.',
}
