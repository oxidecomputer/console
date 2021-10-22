import { Avatar } from './Avatar'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof Avatar>>

export default {
  component: Avatar,
} as Story

export const Default: Story = {
  args: {
    name: 'Cameron Howe',
    round: true,
  },
}
