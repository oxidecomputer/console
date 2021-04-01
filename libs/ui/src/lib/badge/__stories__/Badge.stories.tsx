import type { Story } from '@storybook/react'
import React from 'react'
import type { BadgeProps } from '../Badge'
import { Badge } from '../Badge'

const Template: Story<BadgeProps> = (args) => <Badge {...args} />

const primary = Template.bind({})
primary.args = { title: 'Badge' }

export const stories = {
  primary,
} as const
