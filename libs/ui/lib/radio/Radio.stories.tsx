import { FormikDecorator } from '../../util/formik-decorator'
import { Radio } from './Radio'
import type { RadioProps } from './Radio'
import type { StoryObj } from '@storybook/react'

export default {
  component: Radio,
  argTypes: {
    checked: { control: 'boolean' },
    children: { control: 'text' },
  },
  decorators: [FormikDecorator()],
} as StoryObj<RadioProps>

export const Unchecked: StoryObj<RadioProps> = {
  args: {
    checked: false,
    children: 'Label',
  },
}

export const Checked: StoryObj<RadioProps> = {
  args: { checked: true, children: 'Label' },
}

export const Disabled: StoryObj<RadioProps> = {
  args: { checked: false, children: 'Label', disabled: true },
}
