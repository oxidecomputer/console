import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import { More12Icon } from '@oxide/ui'
import type { MenuAction } from '@oxide/table'
import { capitalize } from '@oxide/util'

interface MoreActionsMenuProps {
  /** The type of resource being acted on for accessibility purposes. E.g. instance, disk, etc */
  type: string
  actions: MenuAction[]
}
export const MoreActionsMenu = ({ actions, type }: MoreActionsMenuProps) => {
  return (
    <Menu>
      <MenuButton aria-label={`${capitalize(type)} actions`}>
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
