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
        'overflow-x-auto rounded pb-4',
        !scrollStart && 'scrolled',
        isOverflow && !scrollEnd && 'overflowing'
      )}
      autoHide={false}
    >
      <table
        className={cn(className, 'ox-table w-full border-separate text-sans-md')}
        {...props}
      />
    </SimpleBar>
  )
}

export type TableHeaderRowProps = JSX.IntrinsicElements['tr']
Table.HeaderRow = (props: TableHeaderRowProps) => <Table.Row {...props} />

export type TableHeaderProps = JSX.IntrinsicElements['thead']
Table.Header = ({ children, className }: TableHeaderProps) => (
  <thead className={cn('text-left text-mono-sm text-secondary', className)}>
    {children}
  </thead>
)

export type TableHeadCellProps = JSX.IntrinsicElements['th']
Table.HeadCell = ({ className, children, ...props }: TableHeadCellProps) => (
  <th
    className={cn(
      className,
      'border border-x-0 pl-0 text-left text-mono-sm bg-secondary border-default children:first:border-0'
    )}
    {...props}
  >
    <div className="-my-[1px] flex h-9 items-center border-l px-3 border-secondary">
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
    className={cn(
      className,
      'pl-0 text-raise border-default children:first:border-l-0 children:last:-mr-[1px]'
    )}
    {...props}
  >
    <div
      className={cn(
        'relative -my-[1px] -mr-[2px] flex items-center border-b border-l px-3 py-2 border-secondary',
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
      'border py-4 border-secondary': border,
    })}
  >
    {children}
  </div>
)

/**
 * Used _outside_ of the `Table`, this element includes a soon-to-be-removed description of the resource inside the table,
 * along with a link to more info, and a button to take action on the resource listed in the table.
 */
export const TableControls = classed.div`mb-4 flex items-end justify-between space-x-8`
export const TableTitle = classed.div`text-sans-lg text-raise`
