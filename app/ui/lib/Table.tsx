/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import type { JSX } from 'react'

import { classed } from '~/util/classed'

export type TableProps = JSX.IntrinsicElements['table']
/** `className` goes on the outer box so sizing classes also size the frame */
export function Table({ className, ...props }: TableProps) {
  return (
    // a utility, not in table.css, so CardBlock.Body can override it
    <div className={cn('ox-table-scroller pb-2', className)}>
      <div className="ox-table-grid">
        <table className="ox-table text-sans-md w-full" {...props} />
        <div className="ox-table-frame" aria-hidden />
      </div>
    </div>
  )
}

export type TableHeaderRowProps = JSX.IntrinsicElements['tr']
Table.HeaderRow = (props: TableHeaderRowProps) => <Table.Row {...props} />

export type TableHeaderProps = JSX.IntrinsicElements['thead']
Table.Header = ({ children, className }: TableHeaderProps) => (
  <thead className={cn('text-mono-sm text-secondary text-left', className)}>
    {children}
  </thead>
)

export type TableHeadCellProps = JSX.IntrinsicElements['th']
Table.HeadCell = ({ className, children, ...props }: TableHeadCellProps) => (
  <th
    className={cn(
      className,
      'text-mono-sm bg-secondary border-default h-9 border-y pr-px pl-0 text-left first:*:border-l-0'
    )}
    {...props}
  >
    <div className="border-secondary flex h-full items-center border-l px-3">
      {children}
    </div>
  </th>
)

export type TableRowProps = JSX.IntrinsicElements['tr']
Table.Row = ({ className, ...props }: TableRowProps) => (
  <tr className={cn('bg-default', className)} {...props} />
)

export type TableBodyProps = JSX.IntrinsicElements['tbody']
Table.Body = (props: TableBodyProps) => <tbody {...props} />

export type TableCellProps = JSX.IntrinsicElements['td'] & { height?: 'small' | 'large' }
Table.Cell = ({ height = 'small', className, children, ...props }: TableCellProps) => (
  <td className={cn(className, 'text-raise pl-0 first:*:border-l-0')} {...props}>
    <div
      className={cn(
        'border-secondary relative flex items-center overflow-hidden border-b border-l px-3 py-2',
        { 'h-11': height === 'small', 'h-14': height === 'large' }
      )}
    >
      {children}
    </div>
  </td>
)

/**
 * Used _outside_ of the `Table`, this element wraps buttons that sit on top
 * of the table.
 */
export const TableActions = classed.div`-mt-6 mb-3 flex justify-end gap-2`

type TableEmptyBoxProps = {
  children: React.ReactNode
  border?: boolean
}

export const TableEmptyBox = ({ children, border = true }: TableEmptyBoxProps) => (
  <div
    className={cn('flex h-full max-h-[480px] items-center justify-center rounded-lg px-4', {
      'border-secondary border py-4': border,
    })}
  >
    {children}
  </div>
)

export const TableTitle = classed.div`text-sans-lg text-raise`
