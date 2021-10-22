import { Button, buttonSizes, variants } from './Button'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

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
