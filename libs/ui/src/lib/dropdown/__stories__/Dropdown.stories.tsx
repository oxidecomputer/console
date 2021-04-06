import React from 'react'
import type { Story } from '@storybook/react'

import type { DropdownProps } from '../Dropdown'
import { Dropdown } from '../Dropdown'

const Template: Story<DropdownProps> = (args) => <Dropdown {...args} />

export const Default = Template.bind({})
Default.args = {
  label: 'Dropdown Menu',
  options: [
    { value: 'de', label: 'Devon Edwards' },
    { value: 'rm', label: 'Randall Miles' },
    { value: 'cj', label: 'Connie Jones' },
    { value: 'eb', label: 'Esther Black' },
    { value: 'sf', label: 'Shane Flores' },
    { value: 'dh', label: 'Darrell Howard' },
    { value: 'jp', label: 'Jacob Pena' },
    { value: 'nm', label: 'Nathan Mckinney' },
    { value: 'br', label: 'Bessie Robertson' },
  ],
}
