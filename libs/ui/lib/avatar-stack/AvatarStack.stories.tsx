import { AvatarStack } from './AvatarStack'
import type { AvatarStackProps } from './AvatarStack'
import type { StoryObj } from '@storybook/react'

export default {
  component: AvatarStack,
} as StoryObj<AvatarStackProps>

const AVATAR_DATA = [
  { name: 'Haley Clark', round: true },
  { name: 'Cameron Howe', round: true },
  { name: 'Gordon Clark', round: true },
]

export const Default: StoryObj<AvatarStackProps> = {
  args: { data: AVATAR_DATA },
}
