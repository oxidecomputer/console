import React from 'react'
import styled, { css } from 'styled-components'

import { ReactComponent as AddIcon } from '../../assets/add.svg'
import { ReactComponent as DarkModeIcon } from '../../assets/dark-mode.svg'
import { ReactComponent as DashboardIcon } from '../../assets/dashboard.svg'
import { ReactComponent as ExtensionsIcon } from '../../assets/extensions.svg'
import { ReactComponent as FilesIcon } from '../../assets/files.svg'
import { ReactComponent as FoldersIcon } from '../../assets/folders.svg'
import { ReactComponent as OpenFolderIcon } from '../../assets/open-folder.svg'
import { ReactComponent as SearchIcon } from '../../assets/search.svg'
import { ReactComponent as ServerIcon } from '../../assets/server.svg'
import { ReactComponent as UsersIcon } from '../../assets/users.svg'

export const icons = {
  add: <AddIcon />,
  darkMode: <DarkModeIcon />,
  dashboard: <DashboardIcon />,
  extensions: <ExtensionsIcon />,
  files: <FilesIcon />,
  folders: <FoldersIcon />,
  openFolder: <OpenFolderIcon />,
  search: <SearchIcon />,
  server: <ServerIcon />,
  users: <UsersIcon />,
}

type SizeProp = 'base'
export interface IconProps {
  color: string
  name: keyof typeof icons
  size: SizeProp
}

const getSizeStyles = (size: SizeProp) => {
  switch (size) {
    case 'base':
    default:
      return css`
        width: 24px;
      `
  }
}

const StyledIcon = styled.span`
  display: inline-block;

  ${(props) =>
    props.color && props.theme[props.color]
      ? css`
          fill: props.theme.themeColors[props.color];
        `
      : css`
          fill: ${props.color};
        `}
  ${(props: IconProps) => getSizeStyles(props.size)};

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

Icon.defaultProps = {
  color: '#f00',
  size: 'base',
}
