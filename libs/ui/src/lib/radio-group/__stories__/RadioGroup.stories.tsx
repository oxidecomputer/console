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
    <RadioField variant="card" value="50">
      50 GB
    </RadioField>
    <RadioField variant="card" value="100">
      100 GB
    </RadioField>
    <RadioField variant="card" value="200">
      200 GB
    </RadioField>
    <RadioField variant="card" value="300">
      300 GB
    </RadioField>
    <RadioField variant="card" value="400">
      400 GB
    </RadioField>
    <RadioField variant="card" value="500">
      500 GB
    </RadioField>
    <RadioField variant="card" value="600">
      600 GB
    </RadioField>
    <RadioField variant="card" value="700">
      700 GB
    </RadioField>
    <RadioField variant="card" value="800">
      800 GB
    </RadioField>
    <RadioField variant="card" value="900">
      900 GB
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
  defaultValue: '100',
  direction: 'row',
  legend: 'Add storage',
  name: 'group2',
}

export const withFixedRow = CardTemplate.bind({})
withFixedRow.args = {
  direction: 'fixed-row',
  legend: 'Add storage',
  name: 'group3',
}
