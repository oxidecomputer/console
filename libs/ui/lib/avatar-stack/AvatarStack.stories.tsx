import { AvatarStack } from './AvatarStack'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import React from 'react'

type Story = StoryObj<ComponentProps<typeof AvatarStack>>

export default {
  component: AvatarStack,
} as Story

const AVATAR_DATA = [
  { name: 'Haley Clark', round: true },
  { name: 'Cameron Howe', round: true },
  { name: 'Gordon Clark', round: true },
]

export const Default: Story = {
  args: { data: AVATAR_DATA },
}

export const Selected = () => {
  return (
    <div className="is-selected bg-accent-secondary -m-4 p-4">
      <AvatarStack data={AVATAR_DATA} />
    </div>
  )
}
Selected.storyName = `Theme/Selected`
