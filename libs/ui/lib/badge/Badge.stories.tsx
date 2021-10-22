import { Badge } from './Badge'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof Badge>>

export default {
  component: Badge,
} as Story

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}
