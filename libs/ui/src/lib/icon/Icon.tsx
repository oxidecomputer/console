import React from 'react'
import styled from 'styled-components'

import DASHBOARD from '../../assets/dashboard.svg'
import SERVER from '../../assets/server.svg'

const icons = {
  dashboard: DASHBOARD,
  server: SERVER,
}
export interface IconProps {
  name: 'dashboard' | 'server'
  size: 'base'
}

const StyledIcon = styled.span`
  width: ${(props: IconProps) => props.size};

  > svg {
    width: 100%;
    height: auto;

    fill: inherit;
  }
`

export function Icon<IconProps>({ name, ...props }) {
  if (name) {
    return <StyledIcon {...props}>{icons[name]}</StyledIcon>
  }
  return null
}

export default Icon

Icon.defaultProps = {
  size: 'base',
}
