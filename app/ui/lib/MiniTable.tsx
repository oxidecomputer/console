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

export const EmptyState = (props: { title: string; body: string; colSpan: number }) => (
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

export type Column<T> = {
  header: string
  render: (item: T, index: number) => React.ReactNode
}

export type DataMiniTableProps<T> = {
  ariaLabel: string
  items: T[]
  columns: Column<T>[]
  rowKey: (item: T, index: number) => string
  rowLabel: (item: T, index: number) => string
  onRemoveItem: (item: T, index: number) => void
  removeLabel?: (item: T, index: number) => string
  emptyState: {
    title: string
    body: string
  }
  className?: string
}

export function DataMiniTable<T>({
  ariaLabel,
  items,
  columns,
  rowKey,
  rowLabel,
  onRemoveItem,
  removeLabel,
  emptyState,
  className,
}: DataMiniTableProps<T>) {
  return (
    <Table aria-label={ariaLabel} className={className}>
      <Header>
        {columns.map((column, index) => (
          <HeadCell key={index}>{column.header}</HeadCell>
        ))}
        <HeadCell /> {/* For remove button */}
      </Header>

      <Body>
        {items.length ? (
          items.map((item, index) => (
            <Row
              tabIndex={0}
              aria-rowindex={index + 1}
              aria-label={rowLabel(item, index)}
              key={rowKey(item, index)}
            >
              {columns.map((column, colIndex) => (
                <Cell key={colIndex}>{column.render(item, index)}</Cell>
              ))}

              <RemoveCell
                onClick={() => onRemoveItem(item, index)}
                label={
                  removeLabel?.(item, index) ||
                  `Remove ${ariaLabel.toLowerCase()} ${index + 1}`
                }
              />
            </Row>
          ))
        ) : (
          <EmptyState
            title={emptyState.title}
            body={emptyState.body}
            colSpan={columns.length + 1}
          />
        )}
      </Body>
    </Table>
  )
}
