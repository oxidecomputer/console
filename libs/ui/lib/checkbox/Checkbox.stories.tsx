import { Checkbox } from './Checkbox'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof Checkbox>>

export default {
  component: Checkbox,
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    children: { control: 'text' },
  },
} as Story

export const Unchecked: Story = {
  args: { checked: false, indeterminate: false, children: 'Label' },
}
export const Checked: Story = {
  args: { checked: true, indeterminate: false, children: 'Label' },
}
export const Indeterminate: Story = {
  args: { checked: false, indeterminate: true, children: 'Label' },
}
export const NoLabel: Story = {
  args: { checked: false, indeterminate: false },
}
