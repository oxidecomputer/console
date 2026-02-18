/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import React, { useRef, type JSX, type ReactElement } from 'react'
import SimpleBar from 'simplebar-react'

import { useIsOverflow } from '~/hooks/use-is-overflow'
import { classed } from '~/util/classed'

export type TableProps = JSX.IntrinsicElements['table']
export function Table({ className, ...props }: TableProps) {
  const overflowRef = useRef<HTMLDivElement>(null)
  const { isOverflow, scrollStart, scrollEnd } = useIsOverflow(overflowRef, 'horizontal')

  return (
    <SimpleBar
      scrollableNodeProps={{ ref: overflowRef }}
      className={cn(
        'overflow-x-auto rounded-md pb-4',
        !scrollStart && 'scrolled',
        isOverflow && !scrollEnd && 'overflowing'
      )}
      autoHide={false}
    >
      <table
        className={cn(className, 'ox-table text-sans-md w-full border-separate')}
        {...props}
      />
    </SimpleBar>
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
      'text-mono-sm bg-secondary border-default h-9 border-y pr-px pl-0 text-left'
    )}
    {...props}
  >
    <div className="border-secondary flex h-full items-center border-l px-3">
      {children}
    </div>
  </th>
)

export type TableRowProps = JSX.IntrinsicElements['tr'] & {
  selected?: boolean
}
Table.Row = ({ className, selected, ...props }: TableRowProps) => (
  <tr className={cn('bg-default', className, selected && 'is-selected')} {...props} />
)

type RowElt = ReactElement<TableRowProps>

export type TableBodyProps = JSX.IntrinsicElements['tbody']
Table.Body = ({ className, children, ...props }: TableBodyProps) => {
  const rows = React.Children.toArray(children).map((c, i, siblings) => {
    const child = c as RowElt
    const beforeSelected = (siblings[i - 1] as RowElt | undefined)?.props.selected
    const afterSelected = (siblings[i + 1] as RowElt | undefined)?.props.selected
    const className =
      child.props.selected && (beforeSelected || afterSelected)
        ? cn(
            child.props.className,
            'multi-selection',
            !beforeSelected && 'selection-start',
            !afterSelected && 'selection-end'
          )
        : child.props.className
    return React.cloneElement(child, { ...child.props, className })
  })
  return (
    <tbody className={className} {...props}>
      {rows}
    </tbody>
  )
}

export type TableCellProps = JSX.IntrinsicElements['td'] & { height?: 'small' | 'large' }
Table.Cell = ({ height = 'small', className, children, ...props }: TableCellProps) => (
  <td
    className={cn(className, 'text-raise border-default pl-0 first:*:border-l-0')}
    {...props}
  >
    <div
      className={cn(
        'border-secondary relative -mr-[2px] flex items-center overflow-hidden border-b border-l px-3 py-2',
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
