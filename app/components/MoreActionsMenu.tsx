import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'

import type { MenuAction } from '@oxide/table'
import { More12Icon, Tooltip, Wrap } from '@oxide/ui'

interface MoreActionsMenuProps {
  /** The accessible name for the menu button */
  label: string
  actions: MenuAction[]
}
export const MoreActionsMenu = ({ actions, label }: MoreActionsMenuProps) => {
  return (
    <Menu>
      <MenuButton
        aria-label={label}
        className="flex h-8 w-8 items-center justify-center rounded border border-default hover:bg-hover"
      >
        <More12Icon className="text-tertiary" />
      </MenuButton>
      <MenuList className="mt-2">
        {actions.map((a) => (
          <Wrap key={a.label} when={!!a.disabled} with={<Tooltip content={a.disabled} />}>
            <MenuItem
              className={a.className}
              disabled={!!a.disabled}
              onSelect={a.onActivate}
            >
              {a.label}
            </MenuItem>
          </Wrap>
        ))}
      </MenuList>
    </Menu>
  )
}
