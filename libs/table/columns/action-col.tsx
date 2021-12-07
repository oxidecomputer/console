import { More12Icon } from '@oxide/ui'
import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import type { Row } from 'react-table'
import React from 'react'
import { kebabCase } from '@oxide/util'
import type { ApiClient, Result } from '@oxide/api'

export type MenuAction<
  A extends ApiClient,
  M extends keyof A,
  T extends Result<A[M]>
> =
  | {
      label: string
      // @ts-expect-error Complains about T[Items][number] but it works as we want
      onActivate: (item: T[Items][number]) => void
      disabled?: boolean
    }
  // @ts-expect-error Complains about T[Items][number] but it works as we want
  | [label: string, onActivate: (item: T[Items][number]) => void]

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
                      key={kebabCase(`action-${name}`)}
                      onSelect={action[1].bind(null, type) as () => void}
                    >
                      {action[0]}
                    </MenuItem>
                  )
                }
                return (
                  <MenuItem
                    key={kebabCase(`action-${name}`)}
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
