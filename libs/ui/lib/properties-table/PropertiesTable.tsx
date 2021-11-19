import React from 'react'
import type { ReactNode } from 'react'
import { invariant } from '@oxide/util'
import { isOneOf } from '../../util/children'
import { Badge } from '../badge/Badge'
import cn from 'classnames'
import './properties-table.css'

/** The amount of columns we'd like to have if there's enough space */
type DesiredColumns = 1 | 2
export interface PropertiesTableProps {
  className?: string
  children: ReactNode
  columns?: DesiredColumns
}

// const columnsMapping = (columns: DesiredColumns) => {
//   switch (columns) {
//     case 1:
//       return ''
//     case 2:
//       return co
//   }
// }

export function PropertiesTable({ className, children }: PropertiesTableProps) {
  invariant(
    isOneOf(children, [PropertiesTable.Row]),
    'PropertiesTable can only have PropertiesTable.Row as a child'
  )
  return (
    <div
      className={cn(
        className,
        'properties-table grid border border-gray-400 rounded-sm divide-y children:p-2 children:border-gray-500 min-w-min'
      )}
    >
      {children}
    </div>
  )
}

interface PropertiesTableRowProps {
  label: string
  children: ReactNode
}
PropertiesTable.Row = ({ label, children }: PropertiesTableRowProps) => (
  <>
    <span>
      <Badge variant="ghost">{label}</Badge>
    </span>
    <span className="whitespace-nowrap pr-4">{children}</span>
  </>
)

interface PropertiesTableGroupProps {
  children: ReactNode
}

PropertiesTable.Group = ({ children }: PropertiesTableGroupProps) => {
  invariant(
    isOneOf(children, [PropertiesTable]),
    'PropertiesTable can only have PropertiesTable.Row as a child'
  )
  return (
    <div className="flex min-w-min md-:flex-col lg+:space-x-4 md-:first:children:border-b-gray-500 md-:first:children:rounded-b-none md-:last:children:border-t-0 md-:last:children:rounded-t-none">
      {children}
    </div>
  )
}
