import React from 'react'
import styled, { css } from 'styled-components'
import { colors } from '../theme'

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

export type NameType = keyof typeof icons

export interface IconProps {
  /**
   * Set the color using a theme color ("green500")
   */
  color?: keyof typeof colors
  /**
   * Name (which corresponds to the `<title>`) of the SVG
   */
  name: NameType
}

const getColorStyles = (props: IconProps) => {
  if (props.color) {
    const validThemeColor = props.theme.themeColors[props.color]
    if (validThemeColor) {
      // found color in themeColors, use it
      return css`
        fill: ${validThemeColor};
      `
    }
    // set color manually
    return css`
      fill: ${props.color};
    `
  }
  // inherit color
  return css`
    fill: currentColor;
  `
}

const StyledIcon = styled.span<IconProps>`
  display: inline-block;
  width: ${(props) => props.theme.spacing(6)};

  ${(props) => getColorStyles(props)};

  > svg {
    height: auto;
    width: 100%;
    vertical-align: middle;

    fill: inherit;
  }
`

export const Icon = ({ name, ...props }: IconProps) => {
  if (name && icons[name]) {
    return <StyledIcon {...props}>{icons[name]}</StyledIcon>
  }
  return null
}

export default Icon
