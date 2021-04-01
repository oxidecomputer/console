import React from 'react'
import type { Story } from '@storybook/react'

import type { RadioFieldProps } from '../RadioField'
import { RadioField } from '../RadioField'

const Template: Story<RadioFieldProps> = (args) => <RadioField {...args} />

export const Default = Template.bind({})
Default.args = {
  children: 'Automatically format and mount',
  hint: 'Some details about automatically formatting and mounting disks.',
  value: 'custom',
}

export const Checked = Template.bind({})
Checked.args = {
  checked: true,
  children: 'Remember Me',
  value: 'is-checked',
}

export const withHint = Template.bind({})
withHint.args = {
  children: 'Comments',
  hint: 'Get notified when someones posts a comment on a posting.',
  name: 'group',
  value: 'with-hint',
}

export const withError = Template.bind({})
withError.args = {
  children: 'Comments',
  error: true,
  errorMessage: 'This field is required.',
  hint: 'Get notified when someones posts a comment on a posting.',
  name: 'group',
  value: 'with-error',
}

export const TwoLine = Template.bind({})
TwoLine.args = {
  children: '2 CPUs 4 GB RAM',
  value: 'two-line',
  variant: 'two-line',
}
