import { Listbox } from './Listbox'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof Listbox>>

export default {
  component: Listbox,
} as Story

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
    items: SAMPLE_OPTIONS,
  },
}

export const HideLabel: Story = {
  args: {
    items: SAMPLE_OPTIONS,
  },
}

export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'de',
    items: SAMPLE_OPTIONS,
  },
}
