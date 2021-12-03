import React from 'react'
import cn from 'classnames'
import './menu-button.css'

export type TableProps = JSX.IntrinsicElements['table']
export function Table({ className, ...props }: TableProps) {
  return (
    <table
      // TODO: turns out rounded corners on a table requires border-collapse separate,
      // which requires further shenanigans to get the borders to behave
      className={cn(className, 'w-full border border-gray-400 text-sans-md')}
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
  <thead
    className={cn(
      'text-gray-100 bg-gray-550 border-b border-gray-400',
      className
    )}
  >
    {children}
  </thead>
)

export type TableHeadCellProps = JSX.IntrinsicElements['th']
Table.HeadCell = ({ className, ...props }: TableHeadCellProps) => (
  <th
    className={cn(
      className,
      'font-light uppercase text-left px-4 text-mono-md'
    )}
    {...props}
  />
)

export type TableRowProps = JSX.IntrinsicElements['tr']
Table.Row = ({ className, ...props }: TableRowProps) => (
  <tr
    className={cn(className, 'between:border-l between:border-gray-500')}
    {...props}
  />
)

export type TableBodyProps = JSX.IntrinsicElements['tbody']
Table.Body = ({ className, ...props }: TableBodyProps) => (
  <tbody
    className={cn(className, 'between:border-t between:border-gray-500')}
    {...props}
  />
)

export type TableCellProps = JSX.IntrinsicElements['td']
Table.Cell = ({ className, ...props }: TableCellProps) => (
  <td className={cn(className, 'h-16 px-4')} {...props} />
)
