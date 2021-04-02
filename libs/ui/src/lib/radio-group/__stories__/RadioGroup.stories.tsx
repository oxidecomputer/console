import React from 'react'
import type { Story } from '@storybook/react'

import type { RadioGroupProps } from '../RadioGroup'
import { RadioGroup } from '../RadioGroup'
import { RadioField } from '../../radio-field/RadioField'

const Template: Story<RadioGroupProps> = (args) => (
  <RadioGroup {...args}>
    <RadioField
      value="notify"
      hint="Get notified when someones posts a comment on a posting."
    >
      Comments
    </RadioField>
    <RadioField value="do-not-notify" hint="Turn off notifications.">
      Nothing
    </RadioField>
  </RadioGroup>
)

const CardTemplate: Story<RadioGroupProps> = (args) => (
  <RadioGroup {...args}>
    <RadioField variant="card" value="100">
      100 GB
    </RadioField>
    <RadioField variant="card" value="200">
      200 GB
    </RadioField>
    <RadioField variant="card" value="300">
      300 GB
    </RadioField>
  </RadioGroup>
)

export const Default = Template.bind({})
Default.args = {
  legend: 'Notifications',
  name: 'group1',
}

export const withInitialChecked = CardTemplate.bind({})
withInitialChecked.args = {
  legend: 'Add storage',
  name: 'group2',
  defaultValue: '100',
}
