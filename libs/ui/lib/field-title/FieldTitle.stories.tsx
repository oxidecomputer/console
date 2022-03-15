import type { FieldTitle } from './FieldTitle'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof FieldTitle>>

export const Default: Story = {
  args: {
    children: 'hello world',
  },
}

export const WithTip: Story = {
  args: {
    children: 'hello world',
    tip: 'This is often used as the greeting from a new programming language',
  },
}

export const AsLegend: Story = {
  args: {
    children: 'I am legend',
    tip: 'This component is literally a legend element',
    as: 'legend',
  },
}
