import React from 'react'
import type { ComponentProps } from 'react'
import type { StoryObj } from '@storybook/react'
import type { TagVariant, TagColor } from './Tag'
import { Tag, tagColors } from './Tag'
import { Section } from '../../util/story-section'

type Story = StoryObj<ComponentProps<typeof Tag>>

export const All = () => {
  return (
    <main className="flex flex-wrap">
      <Section title="Normal">
        <div className="grid w-max grid-flow-col grid-cols-2 gap-y-1 gap-x-6">
          {Object.entries(tagColors).flatMap(([variant, colors], index) =>
            Object.keys(colors).map((color) => (
              <span
                key={`${variant}-${color}`}
                style={{ gridColumn: index + 1 }}
              >
                <Tag variant={variant as TagVariant} color={color as TagColor}>
                  {variant} {color}
                </Tag>
              </span>
            ))
          )}
        </div>
      </Section>
      <Section title="Narrow">
        <div className="grid w-max grid-flow-col grid-cols-2 gap-x-6">
          {Object.entries(tagColors).flatMap(([variant, colors], index) =>
            Object.keys(colors).map((color) => (
              <span
                key={`${variant}-${color}`}
                style={{ gridColumn: index + 1 }}
              >
                <Tag
                  narrow
                  variant={variant as TagVariant}
                  color={color as TagColor}
                >
                  {variant} {color}
                </Tag>
              </span>
            ))
          )}
        </div>
      </Section>
      <Section title="Closable">
        <div className="grid w-max grid-flow-col grid-cols-2 gap-y-1 gap-x-6">
          {Object.entries(tagColors).flatMap(([variant, colors], index) =>
            Object.keys(colors).map((color) => (
              <span
                key={`${variant}-${color}`}
                style={{ gridColumn: index + 1 }}
              >
                <Tag
                  variant={variant as TagVariant}
                  color={color as TagColor}
                  onClose={() => {}}
                >
                  {variant} {color}
                </Tag>
              </span>
            ))
          )}
        </div>
      </Section>
      <Section title="Closable Narrow">
        <div className="grid w-max grid-flow-col grid-cols-2 gap-x-6">
          {Object.entries(tagColors).flatMap(([variant, colors], index) =>
            Object.keys(colors).map((color) => (
              <span
                key={`${variant}-${color}`}
                style={{ gridColumn: index + 1 }}
              >
                <Tag
                  narrow
                  variant={variant as TagVariant}
                  color={color as TagColor}
                  onClose={() => {}}
                >
                  {variant} {color}
                </Tag>
              </span>
            ))
          )}
        </div>
      </Section>
    </main>
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
  args: {},
}
