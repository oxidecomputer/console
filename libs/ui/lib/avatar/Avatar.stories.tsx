import { Avatar } from './Avatar'
import type { AvatarProps } from './Avatar'
import type { StoryObj } from '@storybook/react'

export default {
  component: Avatar,
} as StoryObj<AvatarProps>

export const Default: StoryObj<AvatarProps> = {
  args: {
    name: 'Cameron Howe',
    round: true,
  },
}
