import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import { TabListLine } from './Tabs'

type Story = StoryObj<ComponentProps<typeof TabListLine>>

export default {
  component: TabListLine,
} as Story

export const Default: Story = {}
