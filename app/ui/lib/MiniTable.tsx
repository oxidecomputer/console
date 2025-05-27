/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ReactNode } from 'react'

import { Error16Icon } from '@oxide/design-system/icons/react'

import { classed } from '~/util/classed'
import { article } from '~/util/str'

import { Button } from './Button'
import { EmptyMessage } from './EmptyMessage'
import { Table as BigTable } from './Table'

type Children = { children: React.ReactNode }

export const Table = classed.table`ox-mini-table w-full border-separate text-sans-md`

export const Header = ({ children }: Children) => (
  <BigTable.Header>
    <BigTable.HeaderRow>{children}</BigTable.HeaderRow>
  </BigTable.Header>
)

export const HeadCell = BigTable.HeadCell

export const Body = classed.tbody``

export const Row = classed.tr`is-selected children:border-default first:children:border-l children:last:border-b last:children:border-r`

export const Cell = ({ children }: Children) => {
  return (
    <td>
      <div>{children}</div>
    </td>
  )
}

export const EmptyState = (props: { title: string; body: string; columnCount: number }) => (
  <Row>
    <td colSpan={props.columnCount}>
      <div className="!m-0 !w-full !flex-col !border-none !bg-transparent !py-14">
        <EmptyMessage title={props.title} body={props.body} />
      </div>
    </td>
  </Row>
)

// followed this for icon in button best practices
// https://www.sarasoueidan.com/blog/accessible-icon-buttons/
export const RemoveCell = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <Cell>
    <button type="button" onClick={onClick} aria-label={label}>
      <Error16Icon aria-hidden focusable="false" />
    </button>
  </Cell>
)

type ClearAndAddButtonsProps = {
  addButtonCopy: string
  disabled: boolean
  onClear: () => void
  onSubmit: () => void
}

/**
 * A set of buttons used with embedded sub-forms to add items to MiniTables,
 * like in the firewall rules and NIC edit forms.
 */
export const ClearAndAddButtons = ({
  addButtonCopy,
  disabled,
  onClear,
  onSubmit,
}: ClearAndAddButtonsProps) => (
  <div className="flex justify-end gap-2.5">
    <Button variant="ghost" size="sm" onClick={onClear} disabled={disabled}>
      Clear
    </Button>
    <Button size="sm" onClick={onSubmit} disabled={disabled}>
      {addButtonCopy}
    </Button>
  </div>
)

type MiniTableProps = {
  resourceName: string
  emptyTableResourceName?: string
  columns: string[]
  rows: ReactNode[][]
  onClick?: () => void
}
export const MiniTable = ({
  resourceName,
  emptyTableResourceName,
  columns,
  rows = [],
  onClick,
}: MiniTableProps) => {
  // assumption here is that if an onClick is passed, there's a remove cell
  const hasRemoveCell = !!onClick
  const emptyTableCopy = `Add ${article(emptyTableResourceName || resourceName)[0]}`
  const columnCount = columns?.length || 0 + (hasRemoveCell ? 1 : 0)
  return (
    <Table className="mb-4" aria-label="Disks">
      <Header>
        {rows.length ? (
          columns?.map((column) => <HeadCell key={column}>{column}</HeadCell>)
        ) : (
          <HeadCell>{resourceName}</HeadCell>
        )}
        {hasRemoveCell && <HeadCell />}
      </Header>
      <Body>
        {rows.length ? (
          rows.map((items, index) => (
            <Row tabIndex={0} aria-rowindex={index + 1} key={items}>
              {items.map((item, index) => (
                <Cell key={index}>{item}</Cell>
              ))}
              {/* Todo: write the callback for the row */}
              <RemoveCell
                onClick={onClick}
                label={`remove ${resourceName}${item.name ? ` ${item.name}` : ''}`}
              />
            </Row>
          ))
        ) : (
          <EmptyState
            title={`No ${resourceName}s`}
            body={emptyTableCopy}
            columnCount={columnCount}
          />
        )}
      </Body>
    </Table>
  )
}
