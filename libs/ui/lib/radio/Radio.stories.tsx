import React from 'react'
import type { Story } from '@storybook/react'
import { Formik } from 'formik'
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

const Template: Story<Props> = (args) => (
  <Formik initialValues={{}} onSubmit={() => {}}>
    <Radio {...args} />
  </Formik>
)

export const Unchecked: Story<Props> = Template.bind({})
Unchecked.args = { checked: false, children: 'Label' }

export const Checked: Story<Props> = Template.bind({})
Checked.args = { checked: true, children: 'Label' }
