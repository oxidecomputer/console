import React from 'react'
import type { Story } from '@storybook/react'

import type { RadioGroupProps } from '../RadioGroup'
import { RadioGroup } from '../RadioGroup'
import { RadioField } from '../../radio-field/RadioField'

const Template: Story<RadioGroupProps> = (args) => (
  <RadioGroup {...args}>
    <RadioField value="notify">Comments</RadioField>
    <RadioField value="do-not-notify">Nothing</RadioField>
  </RadioGroup>
)

const CardTemplate: Story<RadioGroupProps> = (args) => (
  <RadioGroup {...args}>
    <RadioField value="50">50 GB</RadioField>
    <RadioField value="100">100 GB</RadioField>
    <RadioField value="200">200 GB</RadioField>
    <RadioField value="300">300 GB</RadioField>
    <RadioField value="400">400 GB</RadioField>
    <RadioField value="500">500 GB</RadioField>
    <RadioField value="600">600 GB</RadioField>
    <RadioField value="700">700 GB</RadioField>
    <RadioField value="800">800 GB</RadioField>
    <RadioField value="900">900 GB</RadioField>
  </RadioGroup>
)

export const Default = Template.bind({})
Default.args = {
  legend: 'Notifications',
  name: 'group1',
}

export const withInitialChecked = CardTemplate.bind({})
withInitialChecked.args = {
  checked: '100',
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
      checked={value}
      handleChange={handleChange}
      legend="Add storage"
      name="group4"
    >
      <RadioField value="50">50 GB</RadioField>
      <RadioField value="100">100 GB</RadioField>
      <RadioField value="200">200 GB</RadioField>
      <RadioField value="300">300 GB</RadioField>
      <RadioField value="400">400 GB</RadioField>
      <RadioField value="500">500 GB</RadioField>
      <RadioField value="600">600 GB</RadioField>
      <RadioField value="700">700 GB</RadioField>
      <RadioField value="800">800 GB</RadioField>
      <RadioField value="900">900 GB</RadioField>
    </RadioGroup>
  )
}
