import { Button, buttonSizes, variants } from './Button'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import { Section } from '../../util/story-section'
import React from 'react'

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
    variant: 'solid',
  },
}

export const All = () => {
  return (
    <div className="flex flex-wrap space-x-2">
      {variants.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  )
}
