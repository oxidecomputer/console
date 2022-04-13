import React from 'react'
import { EmptyMessage } from './EmptyMessage'
import type { ComponentProps } from 'react'
import type { StoryObj } from '@storybook/react'
import { Instances24Icon } from '../icons'

type Story = StoryObj<ComponentProps<typeof EmptyMessage.Outer>>

export default {
  component: EmptyMessage.Outer,
} as Story

export const Default: Story = {
  args: {
    children: (
      <>
        <EmptyMessage.Icon>
          <Instances24Icon />
        </EmptyMessage.Icon>
        <EmptyMessage.Header>No instances</EmptyMessage.Header>
        <EmptyMessage.Body>
          You need to create an instance to be able to see it here
        </EmptyMessage.Body>
        <EmptyMessage.Link to="/hello">New instance</EmptyMessage.Link>
      </>
    ),
  },
}
