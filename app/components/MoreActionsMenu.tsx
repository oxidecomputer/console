import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import { More12Icon } from '@oxide/ui'
import type { MenuAction } from '@oxide/table'

interface MoreActionsMenuProps {
  actions: MenuAction[]
}
export const MoreActionsMenu = ({ actions }: MoreActionsMenuProps) => {
  return (
    <Menu>
      <MenuButton>
        <More12Icon className="text-tertiary" />
      </MenuButton>
      <MenuList>
        {actions.map((a) => (
          <MenuItem disabled={a.disabled} key={a.label} onSelect={a.onActivate}>
            {a.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}
