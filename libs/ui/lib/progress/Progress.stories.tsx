import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import { Progress } from './Progress'

type Story = StoryObj<ComponentProps<typeof Progress>>

export default {
  component: Progress,
} as Story

export const Default: Story = {}
