import { PropertiesTable } from './PropertiesTable'
import type { ComponentProps } from 'react'
import type { StoryObj } from '@storybook/react'
import React from 'react'

type Story = StoryObj<ComponentProps<typeof PropertiesTable>>

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

export const TwoColumnResponsive: Story = {
  render: () => (
    <PropertiesTable.Group>
      <PropertiesTable>
        <PropertiesTable.Row label="Description">
          Default network for the project
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Dns Name">
          frontend-production-vpn
        </PropertiesTable.Row>
      </PropertiesTable>
      <PropertiesTable>
        <PropertiesTable.Row label="Creation date">
          2 Nov 2020, 06:12:52 UTC
        </PropertiesTable.Row>
        <PropertiesTable.Row label="last modified">
          14 Nov 2020, 12:21:52 UTC
        </PropertiesTable.Row>
      </PropertiesTable>
    </PropertiesTable.Group>
  ),
}
