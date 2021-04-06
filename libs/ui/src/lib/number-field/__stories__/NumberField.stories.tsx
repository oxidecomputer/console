import type { ReactEventHandler } from 'react'
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
  const handleChange: ReactEventHandler = (event) => {
    const { value } = event.target as HTMLInputElement
    setValue(parseInt(value))
  }
  const handleIncrement = () => setValue(value + 1)
  const handleDecrement = () => setValue(value - 1)
  return (
    <NumberField
      onChange={handleChange}
      onDecrement={handleDecrement}
      onIncrement={handleIncrement}
      value={value}
    >
      Number of Instances
    </NumberField>
  )
}
