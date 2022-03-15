import { action } from '@storybook/addon-actions'
import type { TimeoutIndicator } from './TimeoutIndicator'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof TimeoutIndicator>>

export const Default: Story = {
  args: {
    timeout: 5000,
    onTimeoutEnd: action('onTimeoutEnd'),
  },
}
