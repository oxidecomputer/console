import React from 'react'
import type { Story } from '@storybook/react'
import { Checkbox } from './Checkbox'

export default {
  component: Checkbox,
  title: 'Components/Checkbox',
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    label: { control: 'text' },
  },
}

type Props = React.ComponentProps<typeof Checkbox>

const Template: Story<Props> = (args) => <Checkbox {...args} />

export const Unchecked: Story<Props> = Template.bind({})
Unchecked.args = { checked: false, indeterminate: false, label: 'Label' }

export const Checked: Story<Props> = Template.bind({})
Checked.args = { checked: true, indeterminate: false, label: 'Label' }

export const Indeterminate: Story<Props> = Template.bind({})
Indeterminate.args = { checked: false, indeterminate: true, label: 'Label' }
