import { More12Icon } from '@oxide/ui'
import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import type { Row } from 'react-table'
import React from 'react'
import { kebabCase } from '@oxide/util'
import type { ApiListMethods, ResultItem } from '@oxide/api'

export type MakeActions<A extends ApiListMethods, M extends keyof A> = (
  item: ResultItem<A[M]>
) => Array<false | MenuAction>

export type MenuAction = {
  label: string
  onActivate: () => void
  disabled?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getActionsCol(actionsCreator: MakeActions<any, any>) {
  return {
    id: 'menu',
    className: 'w-12',
    Cell: ({ row }: { row: Row }) => {
      const type = row.original
      const actions = actionsCreator(type).filter(Boolean) as MenuAction[]

      return (
        <div className="flex justify-center">
          <Menu>
            <MenuButton>
              <More12Icon className="text-tertiary" />
            </MenuButton>
            <MenuList className="TableControls">
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
