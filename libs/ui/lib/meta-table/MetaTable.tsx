import React from 'react'
import type { ReactNode } from 'react'
import { invariant } from 'app/util/invariant'
import { isOneOf } from 'libs/ui/util/children'
import { Badge } from '@oxide/ui'
import cn from 'classnames'
import './meta-table.css'

export interface MetaTableProps {
  className?: string
  children: ReactNode
}

export function MetaTable({ className, children }: MetaTableProps) {
  invariant(
    isOneOf(children, [MetaTable.Row]),
    'MetaTable can only have MetaTable.Row as a child'
  )
  return (
    <div
      className={cn(
        className,
        'meta-table grid border border-gray-400 rounded-sm divide-y children:p-2 children:border-gray-500'
      )}
      style={{
        gridTemplateColumns: 'minmax(min-content, 1fr) 3fr',
      }}
    >
      {children}
    </div>
  )
}

interface MetaTableRowProps {
  label: string
  children: ReactNode
}
MetaTable.Row = ({ label, children }: MetaTableRowProps) => (
  <>
    <span>
      <Badge variant="ghost">{label}</Badge>
    </span>
    <span>{children}</span>
  </>
)
