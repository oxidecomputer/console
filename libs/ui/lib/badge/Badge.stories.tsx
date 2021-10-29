import { Badge } from './Badge'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import React from 'react'
import type { BadgeColor, BadgeVariant } from '@oxide/ui'
import { badgeColors } from '@oxide/ui'
import { Section } from '../../util/story-section'

type Story = StoryObj<ComponentProps<typeof Badge>>

export default {
  component: Badge,
} as Story

export const All = () => {
  return (
    <div className="flex flex-wrap">
      {Object.entries(badgeColors).flatMap(([variant, colors]) => (
        <Section title={variant}>
          {Object.keys(colors).map((color) => (
            <div key={`${variant}-${color}`}>
              <Badge
                variant={variant as BadgeVariant}
                color={color as BadgeColor}
              >
                {color}
              </Badge>
            </div>
          ))}
        </Section>
      ))}
    </div>
  )
}

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}
