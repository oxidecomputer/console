import { Checkbox } from './Checkbox'
import type { CheckboxProps } from './Checkbox'
import type { StoryObj } from '@storybook/react'

export default {
  component: Checkbox,
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    children: { control: 'text' },
  },
} as StoryObj<CheckboxProps>

export const Unchecked: StoryObj<CheckboxProps> = {
  args: { checked: false, indeterminate: false, children: 'Label' },
}
export const Checked: StoryObj<CheckboxProps> = {
  args: { checked: true, indeterminate: false, children: 'Label' },
}
export const Indeterminate: StoryObj<CheckboxProps> = {
  args: { checked: false, indeterminate: true, children: 'Label' },
}
export const NoLabel: StoryObj<CheckboxProps> = {
  args: { checked: false, indeterminate: false },
}
