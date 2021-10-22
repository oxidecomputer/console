import { FormikDecorator } from '../../util/formik-decorator'
import { Radio } from './Radio'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof Radio>>

export default {
  component: Radio,
  argTypes: {
    checked: { control: 'boolean' },
    children: { control: 'text' },
  },
  decorators: [FormikDecorator()],
} as Story

export const Unchecked: Story = {
  args: {
    checked: false,
    children: 'Label',
  },
}

export const Checked: Story = {
  args: { checked: true, children: 'Label' },
}

export const Disabled: Story = {
  args: { checked: false, children: 'Label', disabled: true },
}
