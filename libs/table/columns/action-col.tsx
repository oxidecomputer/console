import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import type { Row, TableGenerics } from '@tanstack/react-table'

import { More12Icon } from '@oxide/ui'
import { kebabCase } from '@oxide/util'

export type MakeActions<Item> = (item: Item) => Array<MenuAction>

export type MenuAction = {
  label: string
  onActivate: () => void
  disabled?: boolean
  className?: string
}

export const getActionsCol = <TGenerics extends TableGenerics>(
  makeActions: MakeActions<TGenerics['Row']>
) => {
  return {
    id: 'menu',
    header: '',
    meta: { thClassName: 'w-12' },

    cell: ({ row }: { row: Row<TGenerics> }) => {
      // TODO: control flow here has always confused me, would like to straighten it out
      const actions = makeActions(row.original!) // eslint-disable-line @typescript-eslint/no-non-null-assertion
      const id = row.original?.id
      return (
        <div className="flex justify-center">
          <Menu>
            {/* TODO: This name should not suck; future us, make it so! */}
            <MenuButton aria-label="Row actions">
              <More12Icon className="text-tertiary" />
            </MenuButton>
            <MenuList>
              {id && (
                <MenuItem
                  onSelect={() => {
                    window.navigator.clipboard.writeText(id)
                  }}
                >
                  Copy ID
                </MenuItem>
              )}
              {actions.map((action) => {
                return (
                  <MenuItem
                    className={action.className}
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
  }
}
