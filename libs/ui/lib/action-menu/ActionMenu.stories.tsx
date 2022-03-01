import React from 'react'
import { ActionMenu } from './ActionMenu'
import type { ComponentProps } from 'react'
import type { StoryObj } from '@storybook/react'

type Story = StoryObj<ComponentProps<typeof ActionMenu>>

export default {
  component: ActionMenu,
} as Story

const makeItem = (value: string) => (
  <ActionMenu.Item onSelect={() => console.log(value)}>{value}</ActionMenu.Item>
)

export const Default: Story = {
  args: {
    children: [
      makeItem('Add to group'),
      makeItem('Add to role'),
      makeItem('Remove from group'),
      makeItem('Remove role'),
    ],
  },
}
