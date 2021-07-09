import React from 'react'
import type { AvatarStackProps } from '../AvatarStack'
import { AvatarStack } from '../AvatarStack'

const AVATAR_DATA = [
  { name: 'Haley Clark', round: true },
  { name: 'Cameron Howe', round: true },
  { name: 'Gordon Clark', round: true },
]

export const Default = (args: AvatarStackProps) => <AvatarStack {...args} />
Default.storyName = 'Default'
Default.args = { data: AVATAR_DATA }
