import { Checkbox } from './Checkbox'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import React from 'react'

type Story = StoryObj<ComponentProps<typeof Checkbox>>

// export default {
//   component: Checkbox,
//   argTypes: {
//     checked: { control: 'boolean' },
//     indeterminate: { control: 'boolean' },
//     children: { control: 'text' },
//   },
// } as Story

export const All = () => {
  return (
    <div className="flex flex-col space-y-2">
      <Checkbox>default</Checkbox>
      <Checkbox className=":hover">hover</Checkbox>
      <Checkbox className=":focus">focus</Checkbox>
      <Checkbox checked>selected</Checkbox>
      <Checkbox indeterminate>partial</Checkbox>
      <Checkbox indeterminate className=":hover">
        hover, partial
      </Checkbox>
      <Checkbox indeterminate className=":focus">
        focus, partial
      </Checkbox>
      <Checkbox checked className=":hover">
        hover, selected
      </Checkbox>
      <Checkbox checked className=":focus">
        focus, selected
      </Checkbox>
    </div>
  )
}

export const Selected = () => {
  return (
    <div className="is-selected -m-4 p-4 bg-accent-secondary">
      <All />
    </div>
  )
}
Selected.storyName = 'Theme/Selected'

export const Unchecked: Story = {
  args: { checked: false, indeterminate: false, children: 'Label' },
}
export const Checked: Story = {
  args: { checked: true, indeterminate: false, children: 'Label' },
}
export const Indeterminate: Story = {
  args: { checked: false, indeterminate: true, children: 'Label' },
}
export const NoLabel: Story = {
  args: { checked: false, indeterminate: false },
}
