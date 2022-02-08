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
  <thead className={cn('text-left text-mono-sm text-secondary', className)}>
    {children}
  </thead>
)

export type TableHeadCellProps = JSX.IntrinsicElements['th']
Table.HeadCell = ({ className, children, ...props }: TableHeadCellProps) => (
  <th
    className={cn(
      className,
      'border border-x-0 bg-secondary border-default children:first:border-0'
    )}
    {...props}
  >
    <div className="-my-[1px] flex h-9 items-center border-l pl-3 border-secondary">
      {children}
    </div>
  </th>
)

export type TableRowProps = JSX.IntrinsicElements['tr']
Table.Row = ({ className, ...props }: TableRowProps) => (
  <tr className={cn(className, 'bg-default hover:bg-raise')} {...props} />
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
      'h-16 border-default children:first:-ml-[1px] children:first:border-l-0 children:last:-mr-[1px]'
    )}
    {...props}
  >
    <div className="-my-[1px] -mr-[2px] flex h-16 items-center border-l border-b px-3 text-sans-sm border-secondary">
      {children}
    </div>
  </td>
)
