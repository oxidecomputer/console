import React, { FC, useMemo } from 'react'
import styled, { css } from 'styled-components'
import { v4 as uuidv4 } from 'uuid'
import { Color } from '@oxide/theme'
import { Text, TextProps } from '../text/Text'

import { default as ArrowRightIcon } from '../../assets/arrowRight.svg'
import { default as BookmarkIcon } from '../../assets/bookmark.svg'
import { default as ChevronLeftIcon } from '../../assets/chevronLeft.svg'
import { default as CloseIcon } from '../../assets/close.svg'
import { default as CommandIcon } from '../../assets/command.svg'
import { default as CpuIcon } from '../../assets/cpu.svg'
import { default as DashboardIcon } from '../../assets/dashboard.svg'
import { default as FileIcon } from '../../assets/file.svg'
import { default as InstanceIcon } from '../../assets/instance.svg'
import { default as InstancesIcon } from '../../assets/instances.svg'
import { default as MemoryIcon } from '../../assets/memory.svg'
import { default as MessageIcon } from '../../assets/message.svg'
import { default as MoreIcon } from '../../assets/more.svg'
import { default as OrganizationIcon } from '../../assets/org.svg'
import { default as penIcon } from '../../assets/pen.svg'
import { default as PlayButtonOIcon } from '../../assets/playButtonO.svg'
import { default as PlayPauseOIcon } from '../../assets/playPauseO.svg'
import { default as PlayStopOIcon } from '../../assets/playStopO.svg'
import { default as PlusIcon } from '../../assets/plus.svg'
import { default as ProfileIcon } from '../../assets/profile.svg'
import { default as ProjectIcon } from '../../assets/project.svg'
import { default as ProjectsIcon } from '../../assets/projects.svg'
import { default as PulseIcon } from '../../assets/pulse.svg'
import { default as RackIcon } from '../../assets/rack.svg'
import { default as ResourcesIcon } from '../../assets/resources.svg'
import { default as SearchIcon } from '../../assets/search.svg'
import { default as StopwatchIcon } from '../../assets/stopwatch.svg'
import { default as StorageIcon } from '../../assets/storage.svg'
import { default as SupportIcon } from '../../assets/support.svg'
import { default as ThemeIcon } from '../../assets/theme.svg'
import { default as TrashIcon } from '../../assets/trash.svg'
import { default as UserIcon } from '../../assets/user.svg'
import { default as UsersIcon } from '../../assets/users.svg'

export const icons = {
  arrowRight: ArrowRightIcon,
  bookmark: BookmarkIcon,
  chevronLeft: ChevronLeftIcon,
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
  pen: penIcon,
  playButtonO: PlayButtonOIcon,
  playPauseO: PlayPauseOIcon,
  playStopO: PlayStopOIcon,
  plus: PlusIcon,
  profile: ProfileIcon,
  project: ProjectIcon,
  projects: ProjectsIcon,
  pulse: PulseIcon,
  rack: RackIcon,
  resources: ResourcesIcon,
  search: SearchIcon,
  stopwatch: StopwatchIcon,
  storage: StorageIcon,
  support: SupportIcon,
  theme: ThemeIcon,
  trash: TrashIcon,
  user: UserIcon,
  users: UsersIcon,
}

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

interface StyledIconProps extends TextProps {
  /**
   * Set the color using a theme color ("green500")
   */
  color?: Color
}

const StyledIcon = styled(Text)<StyledIconProps>`
  display: inline-flex;
  width: 1em;

  justify-content: center;
  align-items: center;

  ${(props) => getColorStyles(props.theme.themeColors[props.color])};

  > svg {
    height: auto;
    width: 100%;

    fill: inherit;
  }
`

export interface IconProps extends StyledIconProps {
  /**
   * Name (which corresponds to the `<title>`) of the SVG
   */
  name: Name

  /**
   * Props to pass directly to the SVG
   */
  svgProps?: React.SVGProps<SVGSVGElement> & {
    title?: string
    titleId?: string
  }
}

export const Icon: FC<IconProps> = ({ name, svgProps, ...props }) => {
  const IconComponent = icons[name]
  const titleId = useMemo(() => uuidv4(), [])
  let addSvgProps = { ...svgProps }

  // All icons should have a default <title> tag
  // Generate a titleId here so that the `id` and corresponding `aria-labelledby`
  // attributes are always unique
  if (!addSvgProps.titleId) {
    addSvgProps = { titleId: titleId, ...addSvgProps }
  }

  return (
    <StyledIcon {...props}>
      <IconComponent {...addSvgProps} />
    </StyledIcon>
  )
}

export default Icon
