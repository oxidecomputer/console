import React from 'react'
import type { Story } from '@storybook/react'
import { Radio } from './Radio'

export default {
  component: Radio,
  title: 'Components/Radio',
  argTypes: {
    checked: { control: 'boolean' },
    label: { control: 'text' },
  },
}

type Props = React.ComponentProps<typeof Radio>

const Template: Story<Props> = (args) => <Radio {...args} />

export const Unchecked: Story<Props> = Template.bind({})
Unchecked.args = { checked: false, label: 'Label' }

export const Checked: Story<Props> = Template.bind({})
Checked.args = { checked: true, label: 'Label' }
