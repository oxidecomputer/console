import { MultiSelect } from './MultiSelect'
import type { MultiSelectProps } from './MultiSelect'
import type { StoryObj } from '@storybook/react'

export default {
  component: MultiSelect,
} as StoryObj<MultiSelectProps>

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

export const Default: StoryObj<MultiSelectProps> = {
  args: {
    items: SAMPLE_OPTIONS,
  },
}
