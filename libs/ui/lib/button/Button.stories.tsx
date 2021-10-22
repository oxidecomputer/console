import { Button, buttonSizes, variants } from './Button'
import type { ButtonProps } from './Button'
import type { StoryObj } from '@storybook/react'

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
} as StoryObj<ButtonProps>

export const Default: StoryObj<ButtonProps> = {
  args: {
    children: 'Button',
    disabled: false,
    size: 'base',
    variant: 'solid',
  },
}
