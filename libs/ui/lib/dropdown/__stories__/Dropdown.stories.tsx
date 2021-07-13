import React from 'react'
import type { Story } from '@storybook/react'

import type { DropdownProps } from '../Dropdown'
import { Dropdown } from '../Dropdown'

const Template: Story<DropdownProps> = (args) => <Dropdown {...args} />

const SAMPLE_OPTIONS = [
  { value: 'de', label: 'Devon Edwards' },
  { value: 'rm', label: 'Randall Miles' },
  { value: 'cj', label: 'Connie Jones' },
  { value: 'eb', label: 'Esther Black' },
  { value: 'sf', label: 'Shane Flores' },
  { value: 'dh', label: 'Darrell Howard' },
  { value: 'jp', label: 'Jacob Pena' },
  { value: 'nm', label: 'Nathan Mckinney' },
  { value: 'br', label: 'Bessie Robertson' },
]

export const Default = Template.bind({})
Default.args = {
  label: 'Choose an Operator',
  items: SAMPLE_OPTIONS,
}

export const HideLabel = Template.bind({})
HideLabel.args = {
  showLabel: false,
  label: 'Choose an Operator',
  items: SAMPLE_OPTIONS,
}

export const WithDefaultValue = Template.bind({})
WithDefaultValue.args = {
  defaultValue: 'de',
  label: 'Choose an Operator',
  items: SAMPLE_OPTIONS,
}

export const WithHint = Template.bind({})
WithHint.args = {
  showLabel: false,
  label: 'Choose an Operator',
  items: SAMPLE_OPTIONS,
  hint: 'Hint text appears like this',
}
