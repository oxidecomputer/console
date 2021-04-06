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
  options: SAMPLE_OPTIONS,
}

export const Small = Template.bind({})
Small.args = {
  label: 'Choose an Operator',
  options: SAMPLE_OPTIONS,
  size: 'sm',
}

export const Large = Template.bind({})
Large.args = {
  label: 'Choose an Operator',
  options: SAMPLE_OPTIONS,
  size: 'lg',
}
