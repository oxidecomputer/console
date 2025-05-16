/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { flattenChildren } from '~/util/children'

import { Button, type ButtonProps } from './Button'

export interface BulkActionMenuProps {
  selectedCount: number
  children: React.ReactNode
  onSelectAll: () => void
}

export function BulkActionMenu({ children, selectedCount }: BulkActionMenuProps) {
  const actionButtons = flattenChildren(children)
  return (
    <div className="bg-accent-secondary border-accent flex w-fit rounded border *:items-center *:space-x-2 *:p-3">
      <div className="border-accent-tertiary flex border-r">{actionButtons}</div>
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
    className="border-accent-secondary! rounded border"
    {...props}
  />
)
