import { MiniTable } from './MiniTable'
import type { ComponentProps } from 'react'
import type { StoryObj } from '@storybook/react'
import React from 'react'

type Story = StoryObj<ComponentProps<typeof MiniTable>>

export default {
  component: MiniTable,
} as Story

export const Default: Story = {
  args: {
    children: (
      <>
        <MiniTable.Header>
          <MiniTable.HeadCell>Name</MiniTable.HeadCell>
          <MiniTable.HeadCell>Source Type</MiniTable.HeadCell>
          <MiniTable.HeadCell>Size</MiniTable.HeadCell>
        </MiniTable.Header>
        <MiniTable.Body>
          <MiniTable.Row>
            <MiniTable.Cell>disk-1</MiniTable.Cell>
            <MiniTable.Cell>Blank</MiniTable.Cell>
            <MiniTable.Cell>
              128 <span className="text-secondary">GiB</span>
            </MiniTable.Cell>
          </MiniTable.Row>
          <MiniTable.Row>
            <MiniTable.Cell>disk-2</MiniTable.Cell>
            <MiniTable.Cell>Blank</MiniTable.Cell>
            <MiniTable.Cell>
              128 <span className="text-secondary">GiB</span>
            </MiniTable.Cell>
          </MiniTable.Row>
        </MiniTable.Body>
      </>
    ),
  },
}
