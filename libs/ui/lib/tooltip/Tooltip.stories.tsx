import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import { Filter12Icon } from '../icons'
import { Tooltip } from './Tooltip'

type Story = StoryObj<ComponentProps<typeof Tooltip>>

export default {
  component: Tooltip,
} as Story

export const Default: Story = {
  args: {
    children: <Filter12Icon />,
    content: 'Filter',
    onClick: (event: unknown) => console.log(event),
  },
}
