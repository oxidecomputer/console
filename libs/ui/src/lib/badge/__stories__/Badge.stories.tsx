import type { Story } from '@storybook/react'
import React from 'react'
import type { BadgeProps } from '../Badge'
import { Badge, badgeSizes, badgeVariants, badgeColors } from '../Badge'

const Template: Story<BadgeProps> = (args) => <Badge {...args} />

const primary = Template.bind({})
primary.args = { title: 'Badge' }

const variants = badgeVariants.reduce(
  (stories, variant) => ({
    ...stories,
    ...badgeSizes.reduce(
      (stories, size) => ({
        ...stories,
        ...badgeColors.reduce((stories, color) => {
          const story = Template.bind({})
          story.args = { ...primary.args, color, variant, size }
          const storyName =
            size === 'base'
              ? `${variant}_${color}`
              : `${size}_${variant}_${color}`

          return {
            ...stories,
            [storyName]: story,
          }
        }, {}),
      }),
      {}
    ),
  }),
  {}
)

export const stories = {
  primary,
  ...variants,
} as const
