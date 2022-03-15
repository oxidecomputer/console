import type { Spinner } from './Spinner'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof Spinner>>

export const Default: Story = {}
Default.parameters = {
  // flakes all the time due to the animation
  chromatic: { disableSnapshot: true },
}
