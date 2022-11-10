import { flattenChildren } from '@oxide/util'

import type { ButtonProps } from '../button/Button'
import { Button } from '../button/Button'

export interface BulkActionMenuProps {
  selectedCount: number
  children: React.ReactNode
  onSelectAll: () => void
}

export function BulkActionMenu({ children, selectedCount }: BulkActionMenuProps) {
  const actionButtons = flattenChildren(children)
  return (
    <div className="flex w-fit rounded border bg-accent-secondary border-accent children:items-center children:space-x-2 children:p-3">
      <div className="flex border-r border-accent-tertiary">{actionButtons}</div>
      <div className="flex">
        <span className="text-sans-sm text-accent">{selectedCount} selected</span>
      </div>
    </div>
  )
}

BulkActionMenu.Button = (props: Omit<ButtonProps, 'size' | 'variant'>) => (
  <Button
    size="sm"
    // TODO: Remove this border once the proper button styles are available
    className="rounded border !border-accent-secondary"
    {...props}
  />
)
