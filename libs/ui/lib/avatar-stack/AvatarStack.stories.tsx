import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import { AvatarStack } from './AvatarStack'

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
    <div className="is-selected -m-4 p-4 bg-accent-secondary">
      <AvatarStack data={AVATAR_DATA} />
    </div>
  )
}
Selected.storyName = `Theme/Selected`
