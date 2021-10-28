import type { ComponentProps } from 'react'
import React from 'react'
import { Tooltip } from './Tooltip'
import type { StoryObj } from '@storybook/react'
import { FilterSmallIcon } from '../icons'

type Story = StoryObj<ComponentProps<typeof Tooltip>>

export default {
  component: Tooltip,
} as Story

export const Default: Story = {
  args: {
    isPrimaryLabel: true,
    children: <FilterSmallIcon />,
    content: 'Filter',
    onClick: (event: unknown) => console.log(event),
  },
}
