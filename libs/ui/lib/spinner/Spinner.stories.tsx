import { Spinner } from './Spinner'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof Spinner>>

export default {
  component: Spinner,
} as Story

export const Default: Story = {}
