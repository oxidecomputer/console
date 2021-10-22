import { Icon } from './Icon'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof Icon>>

export default { component: Icon } as Story

export const Default: Story = {
  args: { name: 'bookmark' },
}

export const CustomTitle: Story = {
  args: { svgProps: { title: 'Cameron Howe' }, name: 'profile' },
}
