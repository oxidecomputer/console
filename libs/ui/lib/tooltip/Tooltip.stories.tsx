import React from 'react'
import { Tooltip } from './Tooltip'

import { Icon } from '../icon/Icon'

export default {
  component: Tooltip,
}

export const Default = {
  args: {
    isPrimaryLabel: true,
    children: <Icon name="filter" />,
    content: 'Filter',
    onClick: (event: unknown) => console.log(event),
  },
}
