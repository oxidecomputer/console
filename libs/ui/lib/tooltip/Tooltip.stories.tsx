import type { ComponentProps } from 'react'
import React from 'react'
import { Tooltip } from './Tooltip'
import type { StoryObj } from '@storybook/react'
import { Icon } from '../icon/Icon'

type Story = StoryObj<ComponentProps<typeof Tooltip>>

export default {
  component: Tooltip,
} as Story

export const Default: Story = {
  args: {
    isPrimaryLabel: true,
    children: <Icon name="filter" />,
    content: 'Filter',
    onClick: (event: unknown) => console.log(event),
  },
}
