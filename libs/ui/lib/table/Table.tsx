import React from 'react'
import cn from 'classnames'
import './table.css'
import { addProps } from '@oxide/util'

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
Table.HeaderRow = ({ className, ...props }: TableHeaderRowProps) => (
  <Table.Row
    className={cn(
      className,
      'border-b border-gray-500 last-of-type:border-none h-9'
    )}
    {...props}
  />
)

export type TableHeaderProps = JSX.IntrinsicElements['thead']
Table.Header = ({ children, className }: TableHeaderProps) => (
  <thead className={cn('text-gray-100 border border-gray-400', className)}>
    {children}
  </thead>
)

export type TableHeadCellProps = JSX.IntrinsicElements['th']
Table.HeadCell = ({ className, children, ...props }: TableHeadCellProps) => (
  <th
    className={cn(
      className,
      'border border-gray-400 border-x-0 bg-gray-550 font-light uppercase text-left text-mono-md children:first:border-0 pl-0'
    )}
    {...props}
  >
    <div className="border-l border-gray-500 h-9 -my-[1px] flex items-center pl-3">
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
      className,
      (selected && 'is-selected') || 'hover:bg-gray-600'
    )}
    {...props}
  />
)

export type TableBodyProps = JSX.IntrinsicElements['tbody']
Table.Body = ({ className, children, ...props }: TableBodyProps) => {
  const rows = React.Children.toArray(children).map(
    addProps<typeof Table['Row']>((i, props, siblings) => {
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
      'border-gray-400 h-16 children:first:border-l-0 children:last:-mr-[1px] selected:bg-green-950 selected:text-green-500 pl-0'
    )}
    {...props}
  >
    <div className="flex items-center border-l border-b border-gray-500 h-16 -my-[1px] -mr-[2px] px-3  selected:border-green-900">
      {children}
    </div>
  </td>
)
