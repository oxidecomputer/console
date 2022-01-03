import { Table } from './Table'
import type { ComponentProps } from 'react'
import type { StoryObj } from '@storybook/react'
import React from 'react'

type Story = StoryObj<ComponentProps<typeof Table>>

export default {
  render() {
    return (
      <Table>
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeadCell>id</Table.HeadCell>
            <Table.HeadCell>name</Table.HeadCell>
            <Table.HeadCell>description</Table.HeadCell>
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>abc-123</Table.Cell>
            <Table.Cell>A simple thing</Table.Cell>
            <Table.Cell>A thing that is simple</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>xyz-342</Table.Cell>
            <Table.Cell>Another daily</Table.Cell>
            <Table.Cell>An average example</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  },
} as Story

export const Default: Story = {
  args: {},
}
