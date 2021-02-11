import React from 'react'
import styled, { css } from 'styled-components'

import { ReactComponent as DashboardIcon } from '../../assets/dashboard.svg'
import { ReactComponent as ExtensionsIcon } from '../../assets/extensions.svg'
import { ReactComponent as FoldersIcon } from '../../assets/folders.svg'
import { ReactComponent as OpenFolderIcon } from '../../assets/open-folder.svg'
import { ReactComponent as ServerIcon } from '../../assets/server.svg'

export const icons = {
  dashboard: <DashboardIcon />,
  extensions: <ExtensionsIcon />,
  folders: <FoldersIcon />,
  openFolder: <OpenFolderIcon />,
  server: <ServerIcon />,
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

export function Icon<IconProps>({ name, ...props }) {
  if (name && icons[name]) {
    return <StyledIcon {...props}>{icons[name]}</StyledIcon>
  }
  return null
}

export default Icon

Icon.defaultProps = {
  color: '#ff0000',
  size: 'base',
}
