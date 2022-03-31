import { More12Icon } from '@oxide/ui'
import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import type { Row } from 'react-table'
import type { Row as Row2 } from '@tanstack/react-table'
import React from 'react'
import { kebabCase } from '@oxide/util'

export type MakeActions<Item> = (item: Item) => Array<MenuAction>

export type MenuAction = {
  label: string
  onActivate: () => void
  disabled?: boolean
}

export function getActionsCol<Item>(actionsCreator: MakeActions<Item>) {
  return {
    id: 'menu',
    className: 'w-12',
    Cell: ({ row }: { row: Row }) => {
      const type = row.original
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const actions = actionsCreator(type as any)

      return (
        <div className="flex justify-center">
          <Menu>
            <MenuButton>
              <More12Icon className="text-tertiary" />
            </MenuButton>
            <MenuList>
              {actions.map((action) => {
                return (
                  <MenuItem
                    key={kebabCase(`action-${action.label}`)}
                    onSelect={action.onActivate.bind(null, type)}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </MenuItem>
                )
              })}
            </MenuList>
          </Menu>
        </div>
      )
    },
  }
}

export const actionsCol = <R,>(makeActions: MakeActions<R>) => ({
  id: 'menu',
  header: '', // is this the right way to do this?
  // TODO: fix width at w-12
  cell: ({ row }: { row: Row2<{ Row: R }> }) => {
    // TODO: control flow here has always confused me, would like to straighten it out
    const actions = makeActions(row.original!) // eslint-disable-line @typescript-eslint/no-non-null-assertion
    return (
      <div className="flex justify-center">
        <Menu>
          <MenuButton>
            <More12Icon className="text-tertiary" />
          </MenuButton>
          <MenuList>
            {actions.map((action) => {
              return (
                <MenuItem
                  key={kebabCase(`action-${action.label}`)}
                  onSelect={action.onActivate}
                  disabled={action.disabled}
                >
                  {action.label}
                </MenuItem>
              )
            })}
          </MenuList>
        </Menu>
      </div>
    )
  },
})
