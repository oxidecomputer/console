import React from 'react'
import { Badge, badgeColors } from './Badge'
import type { BadgeColor, BadgeVariant } from './Badge'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import { Section } from '../../util/story-section'

type Story = StoryObj<ComponentProps<typeof Badge>>

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

export const Selected = () => {
  return (
    <div className="is-selected -m-4 p-4 bg-accent-secondary">
      <All />
    </div>
  )
}
Selected.storyName = 'Theme/Selected'

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}
