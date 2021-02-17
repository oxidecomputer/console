import React from 'react'
import styled, { css } from 'styled-components'
import { Color } from '@oxide/theme'

import { ReactComponent as AddIcon } from '../../assets/add.svg'
import { ReactComponent as CommandMenuIcon } from '../../assets/command-menu.svg'
import { ReactComponent as DarkModeIcon } from '../../assets/dark-mode.svg'
import { ReactComponent as DashboardIcon } from '../../assets/dashboard.svg'
import { ReactComponent as ExtensionsIcon } from '../../assets/extensions.svg'
import { ReactComponent as FilesIcon } from '../../assets/files.svg'
import { ReactComponent as FoldersIcon } from '../../assets/folders.svg'
import { ReactComponent as GearIcon } from '../../assets/gear.svg'
import { ReactComponent as HistoryIcon } from '../../assets/history.svg'
import { ReactComponent as InstancesIcon } from '../../assets/instances.svg'
import { ReactComponent as OpenFolderIcon } from '../../assets/open-folder.svg'
import { ReactComponent as PulseIcon } from '../../assets/pulse.svg'
import { ReactComponent as SearchIcon } from '../../assets/search.svg'
import { ReactComponent as ServerIcon } from '../../assets/server.svg'
import { ReactComponent as SupportIcon } from '../../assets/support.svg'
import { ReactComponent as UsersIcon } from '../../assets/users.svg'

export const icons = {
  add: <AddIcon />,
  commandMenu: <CommandMenuIcon />,
  darkMode: <DarkModeIcon />,
  dashboard: <DashboardIcon />,
  extensions: <ExtensionsIcon />,
  files: <FilesIcon />,
  folders: <FoldersIcon />,
  gear: <GearIcon />,
  history: <HistoryIcon />,
  instances: <InstancesIcon />,
  openFolder: <OpenFolderIcon />,
  pulse: <PulseIcon />,
  search: <SearchIcon />,
  server: <ServerIcon />,
  support: <SupportIcon />,
  users: <UsersIcon />,
}
type IconName = keyof typeof icons
export interface IconProps {
  /**
   * Set the color using a theme color ("green500") or a valid CSS value ("blue" or "#f00")
   */
  color: Color | string
  /**
   * Name (which corresponds to the `<title>`) of the SVG
   */
  name: IconName
}

const StyledIcon = styled.span<{ color: string }>`
  display: inline-block;
  width: ${(props) => props.theme.spacing(6)};

  ${(props) =>
    props.color &&
    props.theme.themeColors &&
    props.theme.themeColors[props.color]
      ? css`
          fill: ${props.theme.themeColors[props.color]};
        `
      : css`
          fill: ${props.color};
        `}
  > svg {
    height: auto;
    width: 100%;
    vertical-align: middle;

    fill: inherit;
  }
`

export const Icon = ({ name, color, ...props }: IconProps) => {
  if (name && icons[name]) {
    return (
      <StyledIcon color={color} {...props}>
        {icons[name]}
      </StyledIcon>
    )
  }
  return null
}

export default Icon

Icon.defaultProps = {
  color: 'black',
}
