import React from 'react'
import type { Story } from '@storybook/react'

import type { RadioGroupProps } from '../RadioGroup'
import { RadioGroup } from '../RadioGroup'
import { RadioCard } from '../../radio-card/RadioCard'
import { Radio } from '../../radio/Radio'

export const Default: Story<RadioGroupProps> = (args) => (
  <RadioGroup column {...args}>
    <Radio value="notify">Comments</Radio>
    <Radio value="do-not-notify">Nothing</Radio>
  </RadioGroup>
)
Default.args = {
  legend: 'Notifications',
  name: 'group1',
}

export const Cards: Story<RadioGroupProps> = (args) => (
  <RadioGroup {...args}>
    <RadioCard value="notify">Comments</RadioCard>
    <RadioCard value="do-not-notify">Nothing</RadioCard>
  </RadioGroup>
)
Cards.args = {
  legend: 'Notifications',
  name: 'group1',
}

export const DefaultWithState = () => {
  const [value, setValue] = React.useState('100')
  return (
    <RadioGroup
      value={value}
      onChange={(e) => setValue(e.target.value)}
      legend="Add storage"
      hint="This is some hint text about storage"
      name="group4"
      column
    >
      <Radio value="50">50 GB</Radio>
      <Radio value="100">100 GB</Radio>
      <Radio value="200">200 GB</Radio>
      <Radio value="300">300 GB</Radio>
      <Radio value="400">400 GB</Radio>
      <Radio value="500">500 GB</Radio>
      <Radio value="600">600 GB</Radio>
    </RadioGroup>
  )
}

export const CardsWithState = () => {
  const [value, setValue] = React.useState('100')
  return (
    <RadioGroup
      value={value}
      onChange={(e) => setValue(e.target.value)}
      legend="Add storage"
      hint="This is some hint text about storage"
      name="group4"
    >
      <RadioCard value="50">50 GB</RadioCard>
      <RadioCard value="100">100 GB</RadioCard>
      <RadioCard value="200">200 GB</RadioCard>
      <RadioCard value="300">300 GB</RadioCard>
      <RadioCard value="400">400 GB</RadioCard>
      <RadioCard value="500">500 GB</RadioCard>
      <RadioCard value="600">600 GB</RadioCard>
    </RadioGroup>
  )
}
