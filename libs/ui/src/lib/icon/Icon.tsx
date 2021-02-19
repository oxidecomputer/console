import React, { FC } from 'react'
import styled from 'styled-components'
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
} as const
type Name = keyof typeof icons

interface StyledIconProps {
  /**
   * Set the color using a theme color ("green500")
   */
  color: Color
}

const StyledIcon = styled.span<{ color: Color }>`
  display: inline-block;
  width: ${(props) => props.theme.spacing(6)};
  fill: ${(props) => props.theme.themeColors[props.color]};

  > svg {
    height: auto;
    width: 100%;
    vertical-align: middle;

    fill: inherit;
  }
`

export interface IconProps extends StyledIconProps {
  /**
   * Name (which corresponds to the `<title>`) of the SVG
   */
  name: Name
}

export const Icon: FC<IconProps> = ({ name, ...props }) => (
  <StyledIcon {...props}>{icons[name]}</StyledIcon>
)

export default Icon

Icon.defaultProps = {
  color: 'black',
}
