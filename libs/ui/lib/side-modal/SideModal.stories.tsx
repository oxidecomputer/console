import { SideModal } from './SideModal'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof SideModal>>

export default {
  component: SideModal,
} as Story

export const Default: Story = {}
