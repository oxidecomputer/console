import React from 'react'
import type { Story } from '@storybook/react'
import { avatarSizes } from '../../avatar/Avatar'
import type { AvatarStackProps } from '../AvatarStack'
import { AvatarStack } from '../AvatarStack'

const Template: Story<AvatarStackProps> = (args) => <AvatarStack {...args} />

const AVATAR_DATA = [
  { name: 'Haley Clark', round: true },
  { name: 'Cameron Howe', round: true },
  { name: 'Gordon Clark', round: true },
]

const AVATAR_DATA_VARIETY = [
  {
    name: 'Haley Clark',
    round: true,
    src: 'http://placekitten.com/100/100',
  },
  { name: 'Cameron Howe', round: true },
  { name: 'Maze War', src: 'http://placekitten.com/200/200' },
  { name: 'Colossal Cave Adventure' },
]

export const Default = Template.bind({})
Default.storyName = 'Default'
Default.args = { data: AVATAR_DATA }

export const stories = avatarSizes.reduce((rest, size) => {
  return {
    ...rest,
    [size]: (() => {
      const Story: Story<AvatarStackProps> = Template.bind({})
      Story.storyName = size

      Story.args = { data: AVATAR_DATA_VARIETY, size: size }
      return Story
    })(),
  }
}, {})
