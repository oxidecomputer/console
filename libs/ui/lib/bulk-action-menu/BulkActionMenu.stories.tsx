import React from 'react'
import { BulkActionMenu } from './BulkActionMenu'
import type { ComponentProps } from 'react'
import type { StoryObj } from '@storybook/react'
import { Delete10Icon, Spanner12Icon, Terminal10Icon } from '../icons'

type Story = StoryObj<ComponentProps<typeof BulkActionMenu>>

export default {
  component: BulkActionMenu,
} as Story

export const Default: Story = {
  args: {
    selectedCount: 5,
    children: (
      <>
        <BulkActionMenu.Button>
          <Delete10Icon /> delete
        </BulkActionMenu.Button>
        <BulkActionMenu.Button>
          <Spanner12Icon /> edit
        </BulkActionMenu.Button>
        <BulkActionMenu.Button>
          <Terminal10Icon /> more
        </BulkActionMenu.Button>
      </>
    ),
  },
}
