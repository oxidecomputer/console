import { action } from '@storybook/addon-actions'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import { TimeoutIndicator } from './TimeoutIndicator'

type Story = StoryObj<ComponentProps<typeof TimeoutIndicator>>

export default {
  component: TimeoutIndicator,
} as Story

export const Default: Story = {
  args: {
    timeout: 5000,
    onTimeoutEnd: action('onTimeoutEnd'),
  },
}
