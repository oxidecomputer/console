import { action } from '@storybook/addon-actions'
import { TimeoutIndicator } from './TimeoutIndicator'
import type { TimeoutIndicatorProps } from './TimeoutIndicator'
import type { StoryObj } from '@storybook/react'

export default {
  component: TimeoutIndicator,
} as StoryObj<TimeoutIndicatorProps>

export const Default: StoryObj<TimeoutIndicatorProps> = {
  args: {
    timeout: 5000,
    onTimeoutEnd: action('onTimeoutEnd'),
  },
}
