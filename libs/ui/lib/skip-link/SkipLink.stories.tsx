import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import { SkipLink } from './SkipLink'

type Story = StoryObj<ComponentProps<typeof SkipLink>>

export default {
  component: SkipLink,
} as Story

export const Default: Story = {
  args: {
    className: ':focus',
  },
}
