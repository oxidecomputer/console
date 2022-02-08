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
Table.HeaderRow = (props: TableHeaderRowProps) => <Table.Row {...props} />

export type TableHeaderProps = JSX.IntrinsicElements['thead']
Table.Header = ({ children, className }: TableHeaderProps) => (
  <thead className={cn('text-secondary text-mono-sm text-left', className)}>
    {children}
  </thead>
)

export type TableHeadCellProps = JSX.IntrinsicElements['th']
Table.HeadCell = ({ className, children, ...props }: TableHeadCellProps) => (
  <th
    className={cn(
      className,
      'border border-default border-x-0 bg-secondary children:first:border-0'
    )}
    {...props}
  >
    <div className="border-l border-secondary h-9 -my-[1px] flex items-center pl-3">
      {children}
    </div>
  </th>
)

export type TableRowProps = JSX.IntrinsicElements['tr']
Table.Row = ({ className, ...props }: TableRowProps) => (
  <tr className={cn(className, 'hover:bg-raise bg-default')} {...props} />
)

export type TableBodyProps = JSX.IntrinsicElements['tbody']
Table.Body = ({ className, ...props }: TableBodyProps) => (
  <tbody
    className={cn(className, 'between:border-t between:border-secondary')}
    {...props}
  />
)

export type TableCellProps = JSX.IntrinsicElements['td']
Table.Cell = ({ className, children, ...props }: TableCellProps) => (
  <td
    className={cn(
      className,
      'border-default h-16 children:first:border-l-0 children:first:-ml-[1px] children:last:-mr-[1px]'
    )}
    {...props}
  >
    <div className="flex items-center border-l border-b border-secondary h-16 -my-[1px] -mr-[2px] px-3 text-sans-sm">
      {children}
    </div>
  </td>
)
