import type { Dropdown } from './Dropdown'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof Dropdown>>

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

export const Default: Story = {
  args: {
    label: 'Choose an Operator',
    items: SAMPLE_OPTIONS,
  },
}

export const HideLabel: Story = {
  args: {
    showLabel: false,
    label: 'Choose an Operator',
    items: SAMPLE_OPTIONS,
  },
}

export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'de',
    label: 'Choose an Operator',
    items: SAMPLE_OPTIONS,
  },
}

export const WithHint: Story = {
  args: {
    showLabel: false,
    label: 'Choose an Operator',
    items: SAMPLE_OPTIONS,
    hint: 'Hint text appears like this',
  },
}
