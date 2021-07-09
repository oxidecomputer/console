import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import type { TimeoutIndicatorProps } from './TimeoutIndicator'
import { TimeoutIndicator } from './TimeoutIndicator'

export default {
  title: 'Components/Timeout Indicator',
} as Meta

const Template: Story<TimeoutIndicatorProps> = (args) => (
  <TimeoutIndicator {...args} />
)
export const Primary = Template.bind({})
Primary.args = {
  timeout: 5000,
  onTimeoutEnd: action('onTimeoutEnd'),
}
