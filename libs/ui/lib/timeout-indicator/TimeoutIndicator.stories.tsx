import type { Meta } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { TimeoutIndicator } from './TimeoutIndicator'

export default {
  component: TimeoutIndicator,
} as Meta

export const Primary = {
  args: {
    timeout: 5000,
    onTimeoutEnd: action('onTimeoutEnd'),
  },
}
