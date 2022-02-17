import { Avatar } from './Avatar'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import React from 'react'

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

export const Selected = () => {
  return (
    <div className="is-selected bg-accent-secondary -m-4 p-4">
      <Avatar name="Cameron Howe" round={true} />
    </div>
  )
}
Selected.storyName = 'Theme/Selected'
