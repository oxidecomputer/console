import React from 'react'
import type { Story } from '@storybook/react'
import { Formik } from 'formik'

import { RadioGroup } from '../RadioGroup'
import { RadioCard } from '../../radio-card/RadioCard'
import { Radio } from '../../radio/Radio'

type Props = React.ComponentProps<typeof RadioGroup>

export const Default: Story<Props> = (args) => (
  <Formik initialValues={{ group1: 'notify' }} onSubmit={() => {}}>
    <RadioGroup column {...args}>
      <Radio value="notify">Comments</Radio>
      <Radio value="do-not-notify">Nothing</Radio>
    </RadioGroup>
  </Formik>
)
Default.args = {
  name: 'group1',
}

export const DefaultColumn = () => (
  <Formik initialValues={{ group3: '100' }} onSubmit={() => {}}>
    <form>
      <RadioGroup name="group3" column>
        <Radio value="50">50 GB</Radio>
        <Radio value="100">100 GB</Radio>
        <Radio value="200">200 GB</Radio>
        <Radio value="300">300 GB</Radio>
        <Radio value="400">400 GB</Radio>
        <Radio value="500">500 GB</Radio>
        <Radio value="600">600 GB</Radio>
      </RadioGroup>
    </form>
  </Formik>
)

export const Cards = () => (
  <Formik initialValues={{ group4: '100' }} onSubmit={() => {}}>
    <form>
      <RadioGroup name="group4">
        <RadioCard value="50">50 GB</RadioCard>
        <RadioCard value="100">100 GB</RadioCard>
        <RadioCard value="200">200 GB</RadioCard>
        <RadioCard value="300">300 GB</RadioCard>
        <RadioCard value="400">400 GB</RadioCard>
        <RadioCard value="500">500 GB</RadioCard>
        <RadioCard value="600">600 GB</RadioCard>
      </RadioGroup>
    </form>
  </Formik>
)
