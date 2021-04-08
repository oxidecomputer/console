import React from 'react'
import type { Story } from '@storybook/react'
import type { NumberFieldProps } from '../NumberField'
import { NumberField } from '../NumberField'

const Template: Story<NumberFieldProps> = (args) => <NumberField {...args} />

export const Default = Template.bind({})
Default.args = {
  children: 'Number of Instances',
  id: 'default',
}

export const WithState = () => {
  const [value, setValue] = React.useState(0)
  const handleChange = (value: number) => {
    setValue(value)
  }
  return (
    <NumberField handleChange={handleChange} value={value}>
      Number of Instances
    </NumberField>
  )
}
