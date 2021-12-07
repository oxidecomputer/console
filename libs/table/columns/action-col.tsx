import { More12Icon } from '@oxide/ui'
import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import type { Row } from 'react-table'
import React from 'react'
import { kebabCase } from '@oxide/util'
import type { ApiListMethods, ResultItem } from '@oxide/api'

export type MenuAction<
  A extends ApiListMethods,
  M extends keyof A,
  Item extends ResultItem<A[M]>
> = {
  label: string
  onActivate: (item: Item) => void
  disabled?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getActionsCol(actions: MenuAction<any, any, any>[]) {
  return {
    id: 'menu',
    className: 'w-12',
    Cell: ({ row }: { row: Row }) => {
      const type = row.original
      console.log('ROW', row)

      return (
        <div className="flex justify-center">
          <Menu>
            <MenuButton>
              <More12Icon className="text-gray-200" />
            </MenuButton>
            <MenuList className="TableControls">
              {actions.map((action) => {
                if (Array.isArray(action)) {
                  return (
                    <MenuItem
                      key={kebabCase(`action-${action[0]}`)}
                      onSelect={action[1].bind(null, type) as () => void}
                    >
                      {action[0]}
                    </MenuItem>
                  )
                }
                return (
                  <MenuItem
                    key={kebabCase(`action-${action.label}`)}
                    onSelect={action.onActivate.bind(null, type) as () => void}
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
