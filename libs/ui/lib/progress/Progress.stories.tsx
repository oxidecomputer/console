import { Progress } from './Progress'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof Progress>>

export default {
  component: Progress,
} as Story

export const Default: Story = {}
