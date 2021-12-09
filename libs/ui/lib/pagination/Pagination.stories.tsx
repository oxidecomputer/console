import { Pagination } from './Pagination'
import type { ComponentProps } from 'react'
import type { StoryObj } from '@storybook/react'

type Story = StoryObj<ComponentProps<typeof Pagination>>

export default {
  component: Pagination,
} as Story

export const Default: Story = {
  args: { pageSize: 100, hasNext: true, hasPrev: false },
}
