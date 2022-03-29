import React from 'react'
import cn from 'classnames'
import './table.css'
import { addProps, classed } from '@oxide/util'

export type TableProps = JSX.IntrinsicElements['table']
export function Table({ className, ...props }: TableProps) {
  return (
    <table
      className={cn(className, 'ox-table w-full border-separate text-sans-md')}
      {...props}
    />
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
  <tr
    className={cn(
      'bg-default',
      className,
      (selected && 'is-selected') || 'hover:bg-raise'
    )}
    {...props}
  />
)

export type TableBodyProps = JSX.IntrinsicElements['tbody']
Table.Body = ({ className, children, ...props }: TableBodyProps) => {
  const rows = React.Children.toArray(children).map(
    addProps<typeof Table.Row>((i, props, siblings) => {
      const beforeSelected = siblings[i - 1]?.props.selected
      const afterSelected = siblings[i + 1]?.props.selected
      if (props.selected && (beforeSelected || afterSelected)) {
        return {
          className: cn(
            props.className,
            'multi-selection',
            !beforeSelected && 'selection-start',
            !afterSelected && 'selection-end'
          ),
        }
      }
      return {}
    })
  )
  return (
    <tbody className={className} {...props}>
      {rows}
    </tbody>
  )
}

export type TableCellProps = JSX.IntrinsicElements['td']
Table.Cell = ({ className, children, ...props }: TableCellProps) => (
  <td
    className={cn(
      className,
      'h-16 pl-0 text-default border-default children:first:border-l-0 children:last:-mr-[1px]'
    )}
    {...props}
  >
    <div className="-my-[1px] -mr-[2px] flex h-16 items-center border-l border-b px-3 border-secondary">
      {children}
    </div>
  </td>
)

/**
 * Used _outside_ of the `Table`, this element wraps buttons that sit on top
 * of the table.
 */
export const TableActions = classed.div`-mt-11 mb-3 flex justify-end space-x-4`
