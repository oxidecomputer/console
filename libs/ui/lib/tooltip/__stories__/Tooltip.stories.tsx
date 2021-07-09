import React from 'react'
import type { Story } from '@storybook/react'
import type { TooltipProps } from '../Tooltip'
import { Tooltip } from '../Tooltip'

import { Icon } from '../../icon/Icon'

const Template: Story<TooltipProps> = (args) => <Tooltip {...args} />

export const Default = Template.bind({})
Default.args = {
  isPrimaryLabel: true,
  children: <Icon name="filter" />,
  content: 'Filter',
  onClick: (event) => console.log(event),
}
