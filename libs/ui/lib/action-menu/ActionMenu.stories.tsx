import { ActionMenu } from './ActionMenu'
import type { ComponentProps } from 'react'
import type { StoryObj } from '@storybook/react'

type Story = StoryObj<ComponentProps<typeof ActionMenu>>

export default {
  component: ActionMenu,
} as Story

const makeItem = (value: string) => ({
  value,
  onSelect: () => console.log(value),
})

export const Default: Story = {
  args: {
    items: [
      makeItem('Add to group'),
      makeItem('Add to role'),
      makeItem('Remove from group'),
      makeItem('Remove role'),
    ],
  },
}
