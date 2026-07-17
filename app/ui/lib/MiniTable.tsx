/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { useRef, useState, type ReactNode } from 'react'

import { Error16Icon } from '@oxide/design-system/icons/react'

import { Button } from './Button'
import { EmptyMessage } from './EmptyMessage'
import { Tooltip } from './Tooltip'

/*
 * The table is laid out with CSS grid rather than native table layout so text
 * columns can share leftover space and shrink (truncating their contents)
 * when there isn't enough room, which table layout can't express. The
 * explicit ARIA roles look redundant but are required: `display: grid` (and
 * `display: contents` on thead/tbody/tr) strips the implicit table semantics
 * in some browsers.
 */
/* eslint-disable jsx-a11y/no-redundant-roles, jsx-a11y/no-interactive-element-to-noninteractive-role */

/** Divider between cells, inset so it doesn't touch the row's y borders */
const headerSeparator = `relative before:border-secondary before:absolute before:inset-y-px before:left-0 before:w-px before:border-l before:content-['']`
const rowSeparator = `relative before:border-tertiary before:absolute before:inset-y-px before:left-0 before:w-px before:border-l before:content-['']`

const HeadCell = ({
  className,
  children,
}: {
  className?: string
  children?: ReactNode
}) => (
  <th
    role="columnheader"
    className={cn(
      className,
      'text-mono-sm text-secondary bg-secondary border-default flex h-9 items-center border-y px-3'
    )}
  >
    {children}
  </th>
)

const Cell = ({ className, children }: { className?: string; children: ReactNode }) => (
  <td
    role="cell"
    className={cn(
      className,
      'border-default flex h-9 min-w-0 items-center border-y pr-4 pl-3'
    )}
  >
    {children}
  </td>
)

const TruncateCell = ({ text }: { text: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  const inner = (
    <div
      ref={ref}
      className="truncate"
      // check on hover so the tooltip only shows when the text is actually cut off
      onMouseEnter={() => {
        const el = ref.current
        setIsTruncated(!!el && el.scrollWidth > el.clientWidth)
      }}
    >
      {text}
    </div>
  )

  return isTruncated ? (
    <Tooltip content={text} placement="bottom">
      {inner}
    </Tooltip>
  ) : (
    inner
  )
}

const EmptyState = (props: { title: string; body: string }) => (
  <tr
    role="row"
    className="bg-default before:border-default relative col-span-full grid grid-cols-subgrid py-2 before:pointer-events-none before:absolute before:inset-0 before:rounded-b-lg before:border-x before:border-b before:content-['']"
  >
    <td role="cell" className="col-span-full flex flex-col items-center py-4">
      <EmptyMessage title={props.title} body={props.body} />
    </td>
  </tr>
)

// followed this for icon in button best practices
// https://www.sarasoueidan.com/blog/accessible-icon-buttons/
const RemoveCell = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <td role="cell" className="flex h-9 w-11 items-center justify-center">
    <button
      type="button"
      className="text-tertiary hover:text-secondary focus:text-secondary -m-2 flex items-center justify-center p-2"
      onClick={onClick}
      aria-label={label}
    >
      <Error16Icon aria-hidden focusable="false" />
    </button>
  </td>
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
} & (
  | { cell: (item: T) => ReactNode }
  | {
      /** Columns with `text` share leftover table width and truncate (with a
       *  tooltip) when there isn't room; `cell` columns fit their content. */
      text: (item: T) => string
    }
)

function isTextColumn<T>(
  col: Column<T>
): col is { header: string; text: (item: T) => string } {
  return 'text' in col
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

  const hasTextCol = columns.some(isTextColumn)
  // Text columns get `minmax(0, auto)`: sized to their content when
  // everything fits, and shrunk (truncating) when it doesn't, sharing the
  // available space. Empty text columns use `1fr` because there is no body
  // content to make the auto tracks fill the table. `cell` columns always fit
  // their content. If no column is a text column, the first one stretches so
  // the table fills its container.
  const gridTemplateColumns = [
    ...columns.map((col, i) =>
      isTextColumn(col)
        ? items.length === 0
          ? 'minmax(0, 1fr)'
          : 'minmax(0, auto)'
        : i === 0 && !hasTextCol
          ? 'auto'
          : 'max-content'
    ),
    'min-content', // remove button column
  ].join(' ')

  return (
    <table
      role="table"
      aria-label={ariaLabel}
      style={{ gridTemplateColumns }}
      className={cn('text-sans-md grid w-full', className)}
    >
      <thead role="rowgroup" className="contents">
        <tr role="row" className="col-span-full grid grid-cols-subgrid">
          {columns.map((column, index) => (
            <HeadCell
              key={index}
              className={index === 0 ? 'rounded-tl-lg border-l' : headerSeparator}
            >
              {column.header}
            </HeadCell>
          ))}
          {/* For remove button */}
          <HeadCell className={cn(headerSeparator, 'w-11 rounded-tr-lg border-r')} />
        </tr>
      </thead>

      <tbody role="rowgroup" className="contents">
        {items.length ? (
          items.map((item, index) => (
            <tr
              role="row"
              tabIndex={0}
              aria-rowindex={index + 1}
              key={rowKey(item, index)}
              className="bg-default before:border-default relative col-span-full grid grid-cols-subgrid pt-2 before:pointer-events-none before:absolute before:inset-0 before:border-x before:content-[''] last:pb-2 last:before:rounded-b-lg last:before:border-b"
            >
              {columns.map((column, colIndex) => (
                <Cell
                  key={colIndex}
                  className={cn(
                    colIndex === 0 ? 'ml-2 rounded-l-md border-l' : rowSeparator,
                    colIndex === columns.length - 1 && 'rounded-r-md border-r'
                  )}
                >
                  {isTextColumn(column) ? (
                    <TruncateCell text={column.text(item)} />
                  ) : (
                    column.cell(item)
                  )}
                </Cell>
              ))}

              <RemoveCell
                onClick={() => onRemoveItem(item)}
                label={removeLabel?.(item) || `Remove item ${index + 1}`}
              />
            </tr>
          ))
        ) : emptyState ? (
          <EmptyState title={emptyState.title} body={emptyState.body} />
        ) : null}
      </tbody>
    </table>
  )
}
