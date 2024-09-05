/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ColumnDef } from '@tanstack/react-table'
import cn from 'classnames'
import { useMemo } from 'react'

import { More12Icon } from '@oxide/design-system/icons/react'

import { DropdownMenu } from '~/ui/lib/DropdownMenu'
import { Tooltip } from '~/ui/lib/Tooltip'
import { Wrap } from '~/ui/util/wrap'
import { kebabCase } from '~/util/str'

export type MakeActions<Item> = (item: Item) => Array<MenuAction>

export type MenuAction = {
  label: string
  onActivate: () => void
  disabled?: false | React.ReactNode
  className?: string
}

/** Convenience helper to combine regular cols with actions col and memoize */
export function useColsWithActions<TData extends Record<string, unknown>>(
  /** Should be static or memoized */
  columns: ColumnDef<TData, any>[], // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Must be memoized to avoid re-renders */
  makeActions: MakeActions<TData>
) {
  return useMemo(() => [...columns, getActionsCol(makeActions)], [columns, makeActions])
}

export const getActionsCol = <TData extends Record<string, unknown>>(
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
      const id = typeof row.original.id === 'string' ? row.original.id : null
      return <RowActions id={id} actions={actions} />
    },
  }
}

type RowActionsProps = {
  /** If `id` is provided, a `Copy ID` menu item will be automatically included. */
  id?: string | null
  /** Use `copyIdLabel` to override the default label (`Copy ID`). */
  copyIdLabel?: string
  actions?: MenuAction[]
}

export const RowActions = ({ id, copyIdLabel = 'Copy ID', actions }: RowActionsProps) => {
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
              {copyIdLabel}
            </DropdownMenu.Item>
          )}
          {actions?.map((action) => {
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
}
