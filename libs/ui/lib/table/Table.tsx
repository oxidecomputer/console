import React from 'react'
import cn from 'classnames'
import './table.css'

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
      'h-9 border-b border-gray-500 last-of-type:border-none'
    )}
    {...props}
  />
)

export type TableHeaderProps = JSX.IntrinsicElements['thead']
Table.Header = ({ children, className }: TableHeaderProps) => (
  <thead className={cn('border border-gray-400 text-gray-100', className)}>
    {children}
  </thead>
)

export type TableHeadCellProps = JSX.IntrinsicElements['th']
Table.HeadCell = ({ className, children, ...props }: TableHeadCellProps) => (
  <th
    className={cn(
      className,
      'border border-x-0 border-gray-400 bg-gray-550 text-left font-light uppercase text-mono-md children:first:border-0'
    )}
    {...props}
  >
    <div className="-my-[1px] flex h-9 items-center border-l border-gray-500 pl-3">
      {children}
    </div>
  </th>
)

export type TableRowProps = JSX.IntrinsicElements['tr']
Table.Row = ({ className, ...props }: TableRowProps) => (
  <tr className={cn(className, 'hover:bg-gray-600')} {...props} />
)

export type TableBodyProps = JSX.IntrinsicElements['tbody']
Table.Body = ({ className, ...props }: TableBodyProps) => (
  <tbody
    className={cn(className, 'between:border-t between:border-gray-500')}
    {...props}
  />
)

export type TableCellProps = JSX.IntrinsicElements['td']
Table.Cell = ({ className, children, ...props }: TableCellProps) => (
  <td
    className={cn(
      className,
      'h-16 border-gray-400 children:first:-ml-[1px] children:first:border-l-0 children:last:-mr-[1px]'
    )}
    {...props}
  >
    <div className="-my-[1px] -mr-[2px] flex h-16 items-center border-l border-b border-gray-500 px-3">
      {children}
    </div>
  </td>
)
