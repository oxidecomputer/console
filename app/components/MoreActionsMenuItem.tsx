/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import cn from 'classnames'
import type { ReactNode } from 'react'

import { DropdownMenu } from '~/ui/lib/DropdownMenu'
import { Tooltip } from '~/ui/lib/Tooltip'
import { Wrap } from '~/ui/util/wrap'

type MoreActionsMenuItemProps = {
  className?: string
  disabled?: ReactNode
  label: string
  onActivate(): void
}
export const MoreActionsMenuItem = ({
  className,
  disabled,
  label,
  onActivate,
}: MoreActionsMenuItemProps) => {
  const destructive = label.toLowerCase() === 'delete' && !disabled
  return (
    <Wrap key={label} when={!!disabled} with={<Tooltip content={disabled} />}>
      <DropdownMenu.Item
        className={cn(className, { destructive })}
        disabled={!!disabled}
        onSelect={onActivate}
      >
        {label}Y
      </DropdownMenu.Item>
    </Wrap>
  )
}
