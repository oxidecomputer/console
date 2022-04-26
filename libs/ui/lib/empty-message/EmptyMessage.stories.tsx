import { EmptyMessage } from './EmptyMessage'
import type { ComponentProps } from 'react'
import type { StoryObj } from '@storybook/react'
import { Instances24Icon } from '../icons'

type Story = StoryObj<ComponentProps<typeof EmptyMessage>>

export default {
  component: EmptyMessage,
} as Story

export const Default: Story = {
  args: {
    icon: <Instances24Icon />,
    title: 'No instances',
    body: 'You need to create an instance to be able to see it here',
    buttonText: 'New instance',
    buttonTo: 'new',
  },
}
