import { SkipLink } from './SkipLink'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof SkipLink>>

export default {
  component: SkipLink,
} as Story

export const Default: Story = {}
