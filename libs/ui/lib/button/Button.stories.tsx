import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import { Section } from '../../util/story-section'
import { Button, buttonSizes, colors, variants } from './Button'

type Story = StoryObj<ComponentProps<typeof Button>>

export default {
  component: Button,
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: buttonSizes,
      },
    },
    variant: {
      control: {
        type: 'select',
        options: variants,
      },
    },
  },
} as Story

export const Default: Story = {
  args: {
    children: 'Button',
    disabled: false,
    size: 'base',
    variant: 'default',
  },
}

const states = ['normal', 'hover', 'focus', 'disabled']
export const All = () => {
  return (
    <div className="flex flex-row flex-wrap">
      {states.map((state) => (
        <Section key={state} title={state}>
          {colors.map((color) => (
            <div key={color} className="mb-2 flex flex-row space-x-2">
              {variants.map((variant) => (
                <Button
                  key={variant}
                  variant={variant}
                  color={color}
                  className={`:${state}`}
                >
                  {variant}
                </Button>
              ))}
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
Selected.storyName = `Theme/Selected`
