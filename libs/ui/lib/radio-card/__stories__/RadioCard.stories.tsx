import React from 'react'
import type { Story } from '@storybook/react'
import { Formik } from 'formik'

import { RadioCard } from '../RadioCard'

type RadioCardProps = React.ComponentProps<typeof RadioCard>

const Template: Story<RadioCardProps> = (args) => (
  <Formik initialValues={{}} onSubmit={() => {}}>
    <RadioCard {...args} />
  </Formik>
)
export const Default = Template.bind({})
Default.args = {
  children: 'Automatically format and mount',
  value: 'default',
}

export const Checked = Template.bind({})
Checked.args = {
  checked: true,
  children: 'Automatically format and mount',
  value: 'is-checked',
}

const twoLines = (
  <>
    <div>2 CPUs</div>
    <div>4 GB RAM</div>
  </>
)

export const TwoLinesChecked = Template.bind({})
TwoLinesChecked.args = {
  checked: true,
  children: twoLines,
  value: 'is-checked',
}

export const TwoLinesDefault = Template.bind({})
TwoLinesDefault.args = {
  children: twoLines,
  value: 'default',
}
