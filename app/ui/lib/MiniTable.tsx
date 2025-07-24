/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Error16Icon } from '@oxide/design-system/icons/react'

import { classed } from '~/util/classed'

import { Button } from './Button'
import { EmptyMessage } from './EmptyMessage'
import { Table as BigTable } from './Table'

type Children = { children: React.ReactNode }

const Table = classed.table`ox-mini-table w-full border-separate text-sans-md`

const Header = ({ children }: Children) => (
  <BigTable.Header>
    <BigTable.HeaderRow>{children}</BigTable.HeaderRow>
  </BigTable.Header>
)

const HeadCell = BigTable.HeadCell

const Body = classed.tbody``

const Row = classed.tr`is-selected children:border-default first:children:border-l children:last:border-b last:children:border-r`

const Cell = ({ children }: Children) => {
  return (
    <td>
      <div>{children}</div>
    </td>
  )
}

const EmptyState = (props: { title: string; body: string; colSpan: number }) => (
  <Row>
    <td colSpan={props.colSpan}>
      <div className="!m-0 !w-full !flex-col !border-none !bg-transparent !py-14">
        <EmptyMessage title={props.title} body={props.body} />
      </div>
    </td>
  </Row>
)

export const InputCell = ({
  colSpan,
  defaultValue,
  placeholder,
}: {
  colSpan?: number
  defaultValue: string
  placeholder: string
}) => (
  <td colSpan={colSpan}>
    <div>
      <input
        type="text"
        className="text-sm m-0 w-full bg-transparent p-0 !outline-none text-default placeholder:text-quaternary"
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </div>
  </td>
)

// followed this for icon in button best practices
// https://www.sarasoueidan.com/blog/accessible-icon-buttons/
const RemoveCell = ({ onClick, label }: { onClick: () => void; label: string }) => (
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

type Column<T> = {
  header: string
  cell: (item: T, index: number) => React.ReactNode
}

type MiniTableProps<T> = {
  ariaLabel: string
  items: T[]
  columns: Column<T>[]
  rowKey: (item: T, index: number) => string
  onRemoveItem: (item: T) => void
  removeLabel?: (item: T) => string
  /**
   * If empty state is not provided, the entire table will disappear when items
   * is empty
   */
  emptyState?: { title: string; body: string }
  className?: string
}

/** If `emptyState` is left out, `MiniTable` renders null when `items` is empty. */
export function MiniTable<T>({
  ariaLabel,
  items,
  columns,
  rowKey,
  onRemoveItem,
  removeLabel,
  emptyState,
  className,
}: MiniTableProps<T>) {
  if (!emptyState && items.length === 0) return null

  return (
    <Table aria-label={ariaLabel} className={className}>
      <Header>
        {columns.map((column, index) => (
          <HeadCell key={index}>{column.header}</HeadCell>
        ))}
        {/* For remove button column */}
        <HeadCell />
      </Header>

      <Body>
        {items.length ? (
          items.map((item, index) => (
            <Row tabIndex={0} aria-rowindex={index + 1} key={rowKey(item, index)}>
              {columns.map((column, colIndex) => (
                <Cell key={colIndex}>{column.cell(item, index)}</Cell>
              ))}

              <RemoveCell
                onClick={() => onRemoveItem(item)}
                label={removeLabel?.(item) || `Remove item ${index + 1}`}
              />
            </Row>
          ))
        ) : emptyState ? (
          <EmptyState
            title={emptyState.title}
            body={emptyState.body}
            colSpan={columns.length + 1}
          />
        ) : null}
      </Body>
    </Table>
  )
}
