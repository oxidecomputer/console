import { flattenChildren } from '@oxide/util'
import React from 'react'
import type { ButtonProps } from '../button/Button'
import { Button } from '../button/Button'

export interface BulkActionMenuProps {
  selectedCount: number
  children: React.ReactNode
  onSelectAll: () => void
}

export function BulkActionMenu({
  children,
  selectedCount,
}: BulkActionMenuProps) {
  const actionButtons = flattenChildren(children)
  return (
    <div className="flex rounded-sm border border-accent bg-accent-dim children:p-3 children:items-center children:space-x-2 w-fit">
      <div className="flex border-r border-accent-tertiary">
        {actionButtons}
      </div>
      <div className="flex">
        <span className="text-sans-sm text-accent">
          {selectedCount} selected
        </span>
      </div>
    </div>
  )
}

BulkActionMenu.Button = (props: Omit<ButtonProps, 'size' | 'variant'>) => (
  <Button
    size="xs"
    variant="dim"
    // TODO: Remove this border once the proper button styles are available
    className="border rounded-sm !border-accent-secondary"
    {...props}
  />
)
