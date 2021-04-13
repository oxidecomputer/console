import React from 'react'
import type { Story } from '@storybook/react'
import type { TooltipProps } from '../Tooltip'
import { Tooltip } from '../Tooltip'

import { Icon } from '../../icon/Icon'
import { Text } from '../../text/Text'

export default {
  component: Tooltip,
  title: 'Tooltip',
}

const Template: Story<TooltipProps> = (args) => <Tooltip {...args} />

export const Default = Template.bind({})
Default.args = {
  children: <Icon name="filter" />,
  content: 'Filter',
}

export const Definition = Template.bind({})
Definition.args = {
  children: <Text size="base">Definition tooltip</Text>,
  content: 'A brief definition of the underlined word above.',
  variant: 'definition',
}
