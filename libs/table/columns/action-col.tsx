/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ColumnDef } from '@tanstack/react-table'
import cn from 'classnames'
import { DropdownMenu } from 'libs/ui/lib/dropdown-menu/DropdownMenu'

import { More12Icon, Tooltip, Wrap } from '@oxide/ui'
import { kebabCase } from '@oxide/util'

export type MakeActions<Item> = (item: Item) => Array<MenuAction>

export type MenuAction = {
  label: string
  onActivate: () => void
  disabled?: false | React.ReactNode
  className?: string
}

export const getActionsCol = <TData extends { id?: string }>(
  makeActions: MakeActions<TData>
): ColumnDef<TData> => {
  return {
    id: 'menu',
    header: '',
    meta: {
      thClassName: 'action-col',
      tdClassName: 'action-col children:p-0 w-10',
    },

    cell: ({ row }) => {
      // TODO: control flow here has always confused me, would like to straighten it out
      const actions = makeActions(row.original)
      const id = row.original.id
      return (
        <DropdownMenu.Root>
          {/* TODO: This name should not suck; future us, make it so! */}
          {/* stopPropagation prevents clicks from toggling row select in a single select table */}
          <DropdownMenu.Trigger
            className="flex h-full w-10 items-center justify-center"
            aria-label="Row actions"
            onClick={(e) => e.stopPropagation()}
          >
            <More12Icon className="text-tertiary" />
          </DropdownMenu.Trigger>
          {/* portal fixes mysterious z-index issue where menu is behind button */}
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" className="-mt-3 mr-2">
              {id && (
                <DropdownMenu.Item
                  onSelect={() => {
                    window.navigator.clipboard.writeText(id)
                  }}
                >
                  Copy ID
                </DropdownMenu.Item>
              )}
              {actions.map((action) => {
                // TODO: Tooltip on disabled button broke, probably due to portal
                return (
                  <Wrap
                    when={!!action.disabled}
                    with={<Tooltip content={action.disabled} />}
                    key={kebabCase(`action-${action.label}`)}
                  >
                    <DropdownMenu.Item
                      className={cn(action.className, {
                        destructive:
                          action.label.toLowerCase() === 'delete' && !action.disabled,
                      })}
                      onSelect={action.onActivate}
                      disabled={!!action.disabled}
                    >
                      {action.label}
                    </DropdownMenu.Item>
                  </Wrap>
                )
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )
    },
  }
}
