import { MetaTable } from './MetaTable'
import type { ComponentProps } from 'react'
import type { StoryObj } from '@storybook/react'
import React from 'react'

type Story = StoryObj<ComponentProps<typeof MetaTable>>

export default {
  component: MetaTable,
} as Story

export const Default: Story = {
  args: {
    children: [
      <MetaTable.Row key={1} label="Description">
        Default network for the project
      </MetaTable.Row>,
      <MetaTable.Row key={2} label="Dns Name">
        frontend-production-vpn
      </MetaTable.Row>,
    ],
  },
}
