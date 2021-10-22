import React from 'react'
import { Tooltip } from './Tooltip'
import type { TooltipProps } from './Tooltip'
import type { StoryObj } from '@storybook/react'

import { Icon } from '../icon/Icon'

export default {
  component: Tooltip,
} as StoryObj<TooltipProps>

export const Default: StoryObj<TooltipProps> = {
  args: {
    isPrimaryLabel: true,
    children: <Icon name="filter" />,
    content: 'Filter',
    onClick: (event: unknown) => console.log(event),
  },
}
