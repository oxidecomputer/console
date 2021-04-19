import React from 'react'
import type { Story } from '@storybook/react'
import type { TooltipProps } from '../Tooltip'
import { Tooltip } from '../Tooltip'

import { Icon } from '../../icon/Icon'
import { Text } from '../../text/Text'

const Template: Story<TooltipProps> = (args) => <Tooltip {...args} />

export const Default = Template.bind({})
Default.args = {
  isPrimaryLabel: true,
  children: <Icon name="filter" />,
  content: 'Filter',
  onClick: (event) => console.log(event),
}

export const Definition = Template.bind({})
Definition.args = {
  isPrimaryLabel: false,
  children: <Text size="base">Definition tooltip</Text>,
  content: 'A brief definition of the underlined word above.',
  variant: 'definition',
}
