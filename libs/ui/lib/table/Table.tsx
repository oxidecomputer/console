import React from 'react'
import cn from 'classnames'

export interface TableProps extends ElementType<'table'> {}
export function Table({ className, ...props }: TableProps) {
  return (
    <table
      // TODO: turns out rounded corners on a table requires border-collapse separate,
      // which requires further shenanigans to get the borders to behave
      className={cn(
        className,
        'w-full border border-gray-400 text-xs font-mono'
      )}
      {...props}
    />
  )
}

interface TableHeaderRowProps extends ElementType<'tr'> {}
Table.HeaderRow = ({ className, ...props }: TableHeaderRowProps) => (
  <Table.Row
    className={cn(
      className,
      'border-b border-gray-500 last-of-type:border-none h-9'
    )}
    {...props}
  />
)

interface TableHeaderProps extends ElementType<'thead'> {}
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

interface TableHeadCellProps extends ElementType<'th'> {}
Table.HeadCell = ({ className, ...props }: TableHeadCellProps) => (
  <th className={cn(className, 'font-light uppercase')} {...props} />
)

interface TableRowProps extends ElementType<'tr'> {}
Table.Row = ({ className, ...props }: TableRowProps) => (
  <tr
    className={cn(className, 'between:border-l between:border-gray-500')}
    {...props}
  />
)

interface TableBodyProps extends ElementType<'tbody'> {}
Table.Body = ({ className, ...props }: TableBodyProps) => (
  <tbody className={cn(className)} {...props} />
)

interface TableCellProps extends ElementType<'td'> {}
Table.Cell = ({ className, ...props }: TableCellProps) => (
  <td className={cn(className, 'h-16')} {...props} />
)
