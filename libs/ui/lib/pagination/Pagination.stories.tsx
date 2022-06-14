import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import { Pagination } from './Pagination'

type Story = StoryObj<ComponentProps<typeof Pagination>>

export default {
  component: Pagination,
} as Story

export const Default: Story = {
  args: { pageSize: 100, hasNext: true, hasPrev: false },
}
