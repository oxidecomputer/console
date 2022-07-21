import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import { TextInput } from './TextInput'

type Story = StoryObj<ComponentProps<typeof TextInput>>

export default {
  component: TextInput,
} as Story

export const Default: Story = {
  args: {
    placeholder: 'Placeholder',
  },
}

export const WithValue: Story = {
  args: {
    value: 'Something here',
  },
}

export const AsTextArea: Story = {
  args: {
    value: 'Something here',
    as: 'textarea',
    rows: 10,
  },
}
