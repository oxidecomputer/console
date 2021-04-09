import React from 'react'
import type { Story } from '@storybook/react'
import type { TooltipProps } from '../Tooltip'
import { Tooltip } from '../Tooltip'

export default {
  component: Tooltip,
  title: 'Tooltip',
}

const Template: Story<TooltipProps> = (args) => <Tooltip {...args} />

export const Default = Template.bind({})
Default.args = {}
