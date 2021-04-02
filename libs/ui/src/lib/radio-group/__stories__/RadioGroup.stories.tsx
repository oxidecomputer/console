import React from 'react'
import type { RadioGroupProps } from '../RadioGroup'
import { RadioGroup } from '../RadioGroup'

export default {
  component: RadioGroup,
  title: 'RadioGroup',
}

export const Default = () => {
  /* eslint-disable-next-line */
  const props: RadioGroupProps = {}

  return <RadioGroup />
}
