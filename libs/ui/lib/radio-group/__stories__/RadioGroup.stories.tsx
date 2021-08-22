import React from 'react'
import type { Story } from '@storybook/react'

import type { RadioGroupProps } from '../RadioGroup'
import { RadioGroup } from '../RadioGroup'
import { RadioCard } from '../../radio-card/RadioCard'

const Template: Story<RadioGroupProps> = (args) => (
  <RadioGroup {...args}>
    <RadioCard value="notify">Comments</RadioCard>
    <RadioCard value="do-not-notify">Nothing</RadioCard>
  </RadioGroup>
)

const CardTemplate: Story<RadioGroupProps> = (args) => (
  <RadioGroup {...args}>
    <RadioCard value="50">50 GB</RadioCard>
    <RadioCard value="100">100 GB</RadioCard>
    <RadioCard value="200">200 GB</RadioCard>
    <RadioCard value="300">300 GB</RadioCard>
    <RadioCard value="400">400 GB</RadioCard>
    <RadioCard value="500">500 GB</RadioCard>
    <RadioCard value="600">600 GB</RadioCard>
    <RadioCard value="700">700 GB</RadioCard>
    <RadioCard value="800">800 GB</RadioCard>
    <RadioCard value="900">900 GB</RadioCard>
  </RadioGroup>
)

export const Default = Template.bind({})
Default.args = {
  legend: 'Notifications',
  name: 'group1',
}

export const withInitialChecked = CardTemplate.bind({})
withInitialChecked.args = {
  value: '100',
  legend: 'Add a general purpose instance',
  hint: 'General purpose instances provide a good balance of CPU, memory, and high performance storage; well suited for a wide range of use cases.',
  name: 'group2',
}

export const WithState = () => {
  const [value, setValue] = React.useState('100')
  const handleChange = (value: string) => {
    setValue(value)
  }
  return (
    <RadioGroup
      value={value}
      handleChange={handleChange}
      legend="Add storage"
      name="group4"
    >
      <RadioCard value="50">50 GB</RadioCard>
      <RadioCard value="100">100 GB</RadioCard>
      <RadioCard value="200">200 GB</RadioCard>
      <RadioCard value="300">300 GB</RadioCard>
      <RadioCard value="400">400 GB</RadioCard>
      <RadioCard value="500">500 GB</RadioCard>
      <RadioCard value="600">600 GB</RadioCard>
      <RadioCard value="700">700 GB</RadioCard>
      <RadioCard value="800">800 GB</RadioCard>
      <RadioCard value="900">900 GB</RadioCard>
    </RadioGroup>
  )
}
