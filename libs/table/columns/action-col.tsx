import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import type { ColumnDef } from '@tanstack/react-table'
import cn from 'classnames'

import { More12Icon } from '@oxide/ui'
import { kebabCase } from '@oxide/util'

export type MakeActions<Item> = (item: Item) => Array<MenuAction>

export type MenuAction = {
  label: string
  onActivate: () => void
  disabled?: boolean
  className?: string
}

export const getActionsCol = <TData extends { id?: string }>(
  makeActions: MakeActions<TData>
): ColumnDef<TData> => {
  return {
    id: 'menu',
    header: '',
    meta: { thClassName: 'w-12' },

    cell: ({ row }) => {
      // TODO: control flow here has always confused me, would like to straighten it out
      const actions = makeActions(row.original)
      const id = row.original.id
      return (
        <div className="flex w-full justify-center">
          <Menu>
            {/* TODO: This name should not suck; future us, make it so! */}
            {/* stopPropagation prevents clicks from toggling row select in a single select table */}
            <MenuButton
              className="-m-4 p-4"
              aria-label="Row actions"
              onClick={(e) => e.stopPropagation()}
            >
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
                    className={cn(
                      action.className,
                      action.label.toLowerCase() === 'delete' &&
                        !action.disabled &&
                        'destructive'
                    )}
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
