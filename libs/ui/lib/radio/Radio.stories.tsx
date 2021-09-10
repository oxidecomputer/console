import React from 'react'
import type { Story } from '@storybook/react'
import { FormikDecorator } from '../../util/formik-decorator'
import { Radio } from './Radio'

export default {
  component: Radio,
  title: 'Components/Radio',
  argTypes: {
    checked: { control: 'boolean' },
    children: { control: 'text' },
  },
  decorators: [FormikDecorator()],
}

type Props = React.ComponentProps<typeof Radio>

const Template: Story<Props> = (args) => <Radio {...args} />

export const Unchecked: Story<Props> = Template.bind({})
Unchecked.args = { checked: false, children: 'Label' }

export const Checked: Story<Props> = Template.bind({})
Checked.args = { checked: true, children: 'Label' }

export const Disabled: Story<Props> = Template.bind({})
Disabled.args = { checked: false, children: 'Label', disabled: true }
