import type { ComponentProps } from 'react'
import React from 'react'
import type { Tooltip } from './Tooltip'
import type { StoryObj } from '@storybook/react'
import { Filter12Icon } from '../icons'

type Story = StoryObj<ComponentProps<typeof Tooltip>>

export const Default: Story = {
  args: {
    isPrimaryLabel: true,
    children: <Filter12Icon />,
    content: 'Filter',
    onClick: (event: unknown) => console.log(event),
  },
}
