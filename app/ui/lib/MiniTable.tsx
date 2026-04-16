import { type ReactNode, useMemo } from 'react'

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
import { textWidth } from './text-width'

type Children = { children: React.ReactNode }

const Table = classed.table`ox-mini-table w-full border-separate text-sans-md`

const Header = ({ children }: Children) => (
  <BigTable.Header>
    <BigTable.HeaderRow>{children}</BigTable.HeaderRow>
  </BigTable.Header>
)

const HeadCell = BigTable.HeadCell

const Body = classed.tbody``

const Row = classed.tr`*:border-default last:*:border-b *:first:border-l *:last:border-r`

const Cell = ({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) => {
  return (
    <td className={className} style={style}>
      <div className="relative">{children}</div>
    </td>
  )
}

const EmptyState = (props: { title: string; body: string; colSpan: number }) => (
  <Row>
    <td colSpan={props.colSpan}>
      <div className="m-0! w-full! flex-col! border-none! bg-transparent! py-14!">
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
        className="text-default placeholder:text-quaternary m-0 w-full bg-transparent p-0 text-sm outline-hidden!"
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

const TruncateCell = ({ text }: { text: string }) => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="absolute inset-x-3 truncate">{text}</div>
  </div>
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
  | { cell: (item: T, index: number) => React.ReactNode }
  | {
      /** Columns with `text` auto-truncate and share remaining table width
       *  proportionally based on their measured text content. */
      text: (item: T) => string
    }
)

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

function isTextColumn<T>(
  col: Column<T>
): col is { header: string; text: (item: T) => string } {
  return 'text' in col
}

/**
 * For each text column, find the max text width across all items, then
 * distribute remaining table width proportionally. Returns a per-column
 * style object (undefined for fit-to-content columns).
 */
function useColumnWidths<T>(columns: Column<T>[], items: T[]) {
  return useMemo(() => {
    const hasTextCols = columns.some(isTextColumn)
    if (!hasTextCols || items.length === 0) {
      // Fall back to the old behavior: first column gets w-full
      return columns.map((_, i) => (i === 0 ? 'w-full' : undefined))
    }

    // Measure max natural text width per text column.
    // text-sans-md = 400 14px/1.125rem SuisseIntl, letter-spacing 0.03rem
    const font = '400 14px SuisseIntl'
    const letterSpacing = '0.03rem'
    const maxWidths = columns.map((col) => {
      if (!isTextColumn(col)) return 0
      let max = 0
      for (const item of items) {
        const w = textWidth(col.text(item), font, letterSpacing)
        if (w > max) max = w
      }
      return max
    })

    const textColCount = maxWidths.filter((w) => w > 0).length
    const totalTextWidth = maxWidths.reduce((sum, w) => sum + w, 0)
    if (totalTextWidth === 0 || textColCount === 0) {
      return columns.map((_, i) => (i === 0 ? 'w-full' : undefined))
    }

    // Max ratio between widest and narrowest text column.
    // 1 = all equal, higher = more variation.
    const maxWidthRatio = 5 / 2
    const equalShare = totalTextWidth / textColCount
    const spread = Math.sqrt(maxWidthRatio)
    const floor = equalShare / spread
    const ceiling = equalShare * spread
    const clamped = maxWidths.map((w) =>
      w > 0 ? Math.min(Math.max(w, floor), ceiling) : 0
    )
    const clampedTotal = clamped.reduce((sum, w) => sum + w, 0)

    // Text columns share available space proportionally; others fit content
    return columns.map((col, i) => {
      if (!isTextColumn(col)) return undefined
      const pct = (clamped[i] / clampedTotal) * 100
      return { width: `${pct.toFixed(1)}%` } as const
    })
  }, [columns, items])
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
  const colWidths = useColumnWidths(columns, items)

  if (!emptyState && items.length === 0) return null

  return (
    <Table aria-label={ariaLabel} className={className}>
      <Header>
        {columns.map((column, index) => (
          <HeadCell key={index}>{column.header}</HeadCell>
        ))}
        {/* For remove button */}
        <HeadCell />
      </Header>

      <Body>
        {items.length ? (
          items.map((item, index) => (
            <Row tabIndex={0} aria-rowindex={index + 1} key={rowKey(item, index)}>
              {columns.map((column, colIndex) => {
                const w = colWidths[colIndex]
                const className = typeof w === 'string' ? w : undefined
                const style = typeof w === 'object' ? w : undefined
                return (
                  <Cell key={colIndex} className={className} style={style}>
                    {isTextColumn(column) ? (
                      <TruncateCell text={column.text(item)} />
                    ) : (
                      column.cell(item, index)
                    )}
                  </Cell>
                )
              })}

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
