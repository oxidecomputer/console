/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { More12Icon } from '@oxide/design-system/icons/react'

import type { MenuAction } from '~/table/columns/action-col'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'
import { Tooltip } from '~/ui/lib/Tooltip'
import { Wrap } from '~/ui/util/wrap'

interface MoreActionsMenuProps {
  /** The accessible name for the menu button */
  label: string
  actions: MenuAction[]
}
export const MoreActionsMenu = ({ actions, label }: MoreActionsMenuProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={label}
        className="flex h-8 w-8 items-center justify-center rounded border border-default hover:bg-tertiary"
      >
        <More12Icon />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="mt-2">
        {actions.map((a) => (
          <Wrap key={a.label} when={!!a.disabled} with={<Tooltip content={a.disabled} />}>
            <DropdownMenu.Item
              className={a.className}
              disabled={!!a.disabled}
              onSelect={a.onActivate}
            >
              {a.label}
            </DropdownMenu.Item>
          </Wrap>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
