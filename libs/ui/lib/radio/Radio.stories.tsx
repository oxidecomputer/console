import { FormikDecorator } from '../../util/formik-decorator'
import { Radio, RadioCard } from './Radio'
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

export const All = () => {
  return (
    <div className="flex flex-col space-y-2">
      <Radio>default</Radio>
      <Radio disabled>disabled</Radio>
      <Radio disabled className=":hover">
        disabled, hover
      </Radio>
      <Radio className=":hover">hover</Radio>
      <Radio className=":focus">focus</Radio>
      <Radio checked>selected</Radio>
      <Radio className=":hover" checked>
        selected, hover
      </Radio>
      <Radio className=":focus" checked>
        selected, focus
      </Radio>
    </div>
  )
}

export const Cards = () => {
  return (
    <div className="flex flex-col space-y-2">
      <RadioCard>
        default <RadioCard.Unit>unit</RadioCard.Unit>
      </RadioCard>
      <RadioCard disabled>
        disabled <RadioCard.Unit>unit</RadioCard.Unit>
      </RadioCard>
      <RadioCard disabled className=":hover">
        disabled, hover <RadioCard.Unit>unit</RadioCard.Unit>
      </RadioCard>
      <RadioCard className=":hover">
        hover <RadioCard.Unit>unit</RadioCard.Unit>
      </RadioCard>
      <RadioCard className=":focus">
        focus <RadioCard.Unit>unit</RadioCard.Unit>
      </RadioCard>
      <RadioCard checked>
        selected <RadioCard.Unit>unit</RadioCard.Unit>
      </RadioCard>
      <RadioCard className=":hover" checked>
        selected, hover <RadioCard.Unit>unit</RadioCard.Unit>
      </RadioCard>
      <RadioCard className=":focus" checked>
        selected, focus <RadioCard.Unit>unit</RadioCard.Unit>
      </RadioCard>
    </div>
  )
}

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
