import * as icons from './index'
import React from 'react'
import { Section } from '../../util/story-section'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof icons.Close8Icon>>

export default {
  argTypes: {
    color: {
      control: {
        type: 'select',
        options: [
          'text-green-500',
          'text-blue-500',
          'text-yellow-500',
          'text-white',
        ],
      },
    },
  },
} as Story

export const All: Story = {
  render: ({ color }) => {
    const iconEntries = Object.entries(icons)
    return (
      <div className="flex max-w-6xl flex-wrap">
        <Section title="24px">
          <div className="flex flex-wrap items-center gap-2">
            {iconEntries
              .filter(([name]) => name.includes('24'))
              .map(([name, Icon]) => (
                <Icon className={color} key={name} />
              ))}
          </div>
        </Section>
        <Section title="16px">
          <div className="flex flex-wrap items-center gap-2">
            {iconEntries
              .filter(([name]) => name.includes('16'))
              .map(([name, Icon]) => (
                <Icon className={color} key={name} />
              ))}
          </div>
        </Section>
        <Section title="12px">
          <div className="flex flex-wrap items-center gap-2">
            {iconEntries
              .filter(([name]) => name.includes('12'))
              .map(([name, Icon]) => (
                <Icon className={color} key={name} />
              ))}
          </div>
        </Section>
        <Section title="8px">
          <div className="flex flex-wrap items-center gap-2">
            {iconEntries
              .filter(([name]) => name.includes('8'))
              .map(([name, Icon]) => (
                <Icon className={color} key={name} />
              ))}
          </div>
        </Section>
        <Section title="Responsive">
          <div className="flex flex-wrap items-center gap-2">
            {iconEntries
              .filter(([name]) => name.includes('Responsive'))
              .map(([name, Icon]) => (
                <Icon className={color} key={name} />
              ))}
          </div>
        </Section>
        <Section title="Misc">
          <div className="flex items-center gap-2">
            {iconEntries
              .filter(
                ([name]) =>
                  !['24', '16', '12', '8', 'Responsive'].some((type) =>
                    name.includes(type)
                  )
              )
              .map(([name, Icon]) => (
                <Icon className={color} key={name} />
              ))}
          </div>
        </Section>
      </div>
    )
  },
}
