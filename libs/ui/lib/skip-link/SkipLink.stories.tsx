import type { SkipLink } from './SkipLink'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof SkipLink>>

export const Default: Story = {
  args: {
    className: ':focus',
  },
}
