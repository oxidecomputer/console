import React, { FC } from 'react'
import styled, { css } from 'styled-components'
import { Color, SizingMultiplier } from '@oxide/theme'

import { ReactComponent as BookmarkIcon } from '../../assets/bookmark.svg'
import { ReactComponent as ChevronIcon } from '../../assets/chevron.svg'
import { ReactComponent as CloseIcon } from '../../assets/close.svg'
import { ReactComponent as CommandIcon } from '../../assets/command.svg'
import { ReactComponent as CpuIcon } from '../../assets/cpu.svg'
import { ReactComponent as DashboardIcon } from '../../assets/dashboard.svg'
import { ReactComponent as FileIcon } from '../../assets/file.svg'
import { ReactComponent as InstanceIcon } from '../../assets/instance.svg'
import { ReactComponent as InstancesIcon } from '../../assets/instances.svg'
import { ReactComponent as MemoryIcon } from '../../assets/memory.svg'
import { ReactComponent as MessageIcon } from '../../assets/message.svg'
import { ReactComponent as MoreIcon } from '../../assets/more.svg'
import { ReactComponent as OrganizationIcon } from '../../assets/org.svg'
import { ReactComponent as PlusIcon } from '../../assets/plus.svg'
import { ReactComponent as ProfileIcon } from '../../assets/profile.svg'
import { ReactComponent as ProjectIcon } from '../../assets/project.svg'
import { ReactComponent as ProjectsIcon } from '../../assets/projects.svg'
import { ReactComponent as PulseIcon } from '../../assets/pulse.svg'
import { ReactComponent as RackIcon } from '../../assets/rack.svg'
import { ReactComponent as ResourcesIcon } from '../../assets/resources.svg'
import { ReactComponent as SearchIcon } from '../../assets/search.svg'
import { ReactComponent as StorageIcon } from '../../assets/storage.svg'
import { ReactComponent as SupportIcon } from '../../assets/support.svg'
import { ReactComponent as ThemeIcon } from '../../assets/theme.svg'
import { ReactComponent as UserIcon } from '../../assets/user.svg'
import { ReactComponent as UsersIcon } from '../../assets/users.svg'

export const icons = {
  bookmark: BookmarkIcon,
  chevron: ChevronIcon,
  close: CloseIcon,
  command: CommandIcon,
  cpu: CpuIcon,
  dashboard: DashboardIcon,
  file: FileIcon,
  instance: InstanceIcon,
  instances: InstancesIcon,
  memory: MemoryIcon,
  message: MessageIcon,
  more: MoreIcon,
  organization: OrganizationIcon,
  plus: PlusIcon,
  profile: ProfileIcon,
  project: ProjectIcon,
  projects: ProjectsIcon,
  pulse: PulseIcon,
  rack: RackIcon,
  resources: ResourcesIcon,
  search: SearchIcon,
  storage: StorageIcon,
  support: SupportIcon,
  theme: ThemeIcon,
  user: UserIcon,
  users: UsersIcon,
} as const
type Name = keyof typeof icons

const getColorStyles = (color?: string) => {
  if (color) {
    return css`
      fill: ${color};
    `
  }
  // inherit color
  return css`
    fill: currentColor;
  `
}

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Name (which corresponds to the `<title>`) of the SVG
   */
  name: Name
  /**
   * Set the color using a theme color ("green500")
   */
  color?: Color
  /**
   * Set the size of the icon using a Sizing Multiplier
   */
  size?: SizingMultiplier
}
const BaseIcon: FC<IconProps> = ({ name, ...props }) => {
  const IconComponent = icons[name]

  return <IconComponent {...props} />
}

export const Icon = styled(BaseIcon)`
  height: auto;
  width: ${({ theme, size }) => theme.spacing(size)};
  vertical-align: middle;

  ${({ theme, color }) => getColorStyles(theme.color(color))}
`
Icon.defaultProps = {
  size: 4,
}

export default Icon
