import { PropertiesTable } from './PropertiesTable'
import type { ComponentProps } from 'react'
import type { StoryObj } from '@storybook/react'
import React from 'react'

type Story = StoryObj<ComponentProps<typeof PropertiesTable>>

export default {
  component: PropertiesTable,
} as Story

export const Default: Story = {
  args: {
    children: [
      <PropertiesTable.Row key={1} label="Description">
        Default network for the project
      </PropertiesTable.Row>,
      <PropertiesTable.Row key={2} label="Dns Name">
        frontend-production-vpn
      </PropertiesTable.Row>,
    ],
  },
}
