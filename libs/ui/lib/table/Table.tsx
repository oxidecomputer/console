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
      'border border-gray-400 border-x-0 bg-gray-550 font-light uppercase text-left text-mono-md children:first:border-0'
    )}
    {...props}
  >
    <div className="border-l border-gray-500 h-9 -my-[1px] flex items-center pl-3">
      {children}
    </div>
  </th>
)

export type TableRowProps = JSX.IntrinsicElements['tr']
Table.Row = ({ className, ...props }: TableRowProps) => (
  <tr className={cn(className, '')} {...props} />
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
      'border-gray-400 h-16 children:first:border-l-0 children:first:-ml-[1px] children:last:-mr-[1px]'
    )}
    {...props}
  >
    <div className="flex items-center border-l border-b border-gray-500 h-16 -my-[1px] -mr-[2px] px-3">
      {children}
    </div>
  </td>
)
