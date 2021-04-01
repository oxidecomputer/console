import React from 'react'
import type { Story } from '@storybook/react'

import type { RadioFieldProps } from '../RadioField'
import { RadioField } from '../RadioField'

const Template: Story<RadioFieldProps> = (args) => <RadioField {...args} />

export const Default = Template.bind({})
Default.args = {
  value: 'custom',
  children: 'Automatically format and mount',
  hint: 'Some details about automatically formatting and mounting disks.',
}

export const Checked = Template.bind({})
Checked.args = {
  checked: true,
  value: 'is-checked',
  children: 'Remember Me',
}

export const withHint = Template.bind({})
withHint.args = {
  name: 'group',
  value: 'with-hint',
  children: 'Comments',
  hint: 'Get notified when someones posts a comment on a posting.',
}

export const withError = Template.bind({})
withError.args = {
  name: 'group',
  value: 'with-error',
  children: 'Comments',
  hint: 'Get notified when someones posts a comment on a posting.',
  error: true,
  errorMessage: 'This field is required.',
}
