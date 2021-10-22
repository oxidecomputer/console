import { Dropdown } from './Dropdown'
import type { DropdownProps } from './Dropdown'
import type { StoryObj } from '@storybook/react'

export default {
  component: Dropdown,
} as StoryObj<DropdownProps>

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

export const Default: StoryObj<DropdownProps> = {
  args: {
    label: 'Choose an Operator',
    items: SAMPLE_OPTIONS,
  },
}

export const HideLabel: StoryObj<DropdownProps> = {
  args: {
    showLabel: false,
    label: 'Choose an Operator',
    items: SAMPLE_OPTIONS,
  },
}

export const WithDefaultValue: StoryObj<DropdownProps> = {
  args: {
    defaultValue: 'de',
    label: 'Choose an Operator',
    items: SAMPLE_OPTIONS,
  },
}

export const WithHint: StoryObj<DropdownProps> = {
  args: {
    showLabel: false,
    label: 'Choose an Operator',
    items: SAMPLE_OPTIONS,
    hint: 'Hint text appears like this',
  },
}
