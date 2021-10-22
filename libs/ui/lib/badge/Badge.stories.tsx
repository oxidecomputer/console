import { Badge } from './Badge'
import type { BadgeProps } from './Badge'
import type { StoryObj } from '@storybook/react'

export default {
  component: Badge,
} as StoryObj<BadgeProps>

export const Default: StoryObj<BadgeProps> = {
  args: {
    children: 'Badge',
  },
}
