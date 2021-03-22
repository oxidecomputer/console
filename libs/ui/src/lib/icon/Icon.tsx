import type { FC } from 'react'
import React, { useMemo } from 'react'
import styled, { css } from 'styled-components'
import { v4 as uuidv4 } from 'uuid'
import type { Color } from '@oxide/theme'

import { default as ArrowIcon } from '../../assets/arrow.svg'
import { default as BookmarkIcon } from '../../assets/bookmark.svg'
import { default as ChevronIcon } from '../../assets/chevron.svg'
import { default as CloseIcon } from '../../assets/close.svg'
import { default as CommandIcon } from '../../assets/command.svg'
import { default as CpuIcon } from '../../assets/cpu.svg'
import { default as DashboardIcon } from '../../assets/dashboard.svg'
import { default as FileIcon } from '../../assets/file.svg'
import { default as InfoFilledIcon } from '../../assets/info-filled.svg'
import { default as InfoIcon } from '../../assets/info.svg'
import { default as InstanceIcon } from '../../assets/instance.svg'
import { default as InstancesIcon } from '../../assets/instances.svg'
import { default as MemoryIcon } from '../../assets/memory.svg'
import { default as MessageIcon } from '../../assets/message.svg'
import { default as MoreIcon } from '../../assets/more.svg'
import { default as NotificationsIcon } from '../../assets/notifications.svg'
import { default as OrganizationIcon } from '../../assets/org.svg'
import { default as PenIcon } from '../../assets/pen.svg'
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
import { default as WarningFilledIcon } from '../../assets/warning-filled.svg'
import { default as WarningIcon } from '../../assets/warning.svg'

export const icons = {
  arrow: ArrowIcon,
  bookmark: BookmarkIcon,
  chevron: ChevronIcon,
  close: CloseIcon,
  command: CommandIcon,
  cpu: CpuIcon,
  dashboard: DashboardIcon,
  file: FileIcon,
  info: InfoIcon,
  infoFilled: InfoFilledIcon,
  instance: InstanceIcon,
  instances: InstancesIcon,
  memory: MemoryIcon,
  message: MessageIcon,
  more: MoreIcon,
  notifications: NotificationsIcon,
  organization: OrganizationIcon,
  pen: PenIcon,
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
  warning: WarningIcon,
  warningFilled: WarningFilledIcon,
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

const rotateStyles = (rotate) => {
  return css`
    transform: rotate(${rotate});
  `
}

const getAlignStyles = (align) => {
  if (align === 'left') {
    return css`
      margin-right: 0.5em;
    `
  }
  if (align === 'right') {
    return css`
      margin-left: 0.5em;
    `
  }
}

interface StyledIconProps {
  /**
   * Add margin to left or right based on alignment
   */
  align?: 'left' | 'right'
  /**
   * Set the color using a theme color ("green500")
   */
  color?: Color
  /**
   * Amount to rotate the SVG icon (useful for "chevron"); expects a number followed by an [angle](https://developer.mozilla.org/en-US/docs/Web/CSS/angle) unit: `90deg`, `0.5turn`
   */
  rotate?: string
}

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

const SvgIcon: FC<IconProps> = ({ name, svgProps, ...props }) => {
  const IconComponent = icons[name]
  const titleId = useMemo(() => uuidv4(), [])
  let addSvgProps = { ...svgProps }

  // All icons should have a default <title> tag
  // Generate a titleId here so that the `id` and corresponding `aria-labelledby`
  // attributes are always unique
  if (!addSvgProps.titleId) {
    addSvgProps = { titleId: titleId, ...svgProps }
  }

  return <IconComponent {...addSvgProps} {...props} />
}

const StyledIcon = styled(SvgIcon).withConfig({
  // Do not pass 'color' and 'rotate' props to the DOM
  shouldForwardProp: (prop, defaultValidatorFn) =>
    !['color', 'rotate'].includes(prop) && defaultValidatorFn(prop),
})<StyledIconProps>`
  flex-shrink: 0;
  width: 1em; /* icon size is controlled by parent font-size */

  ${({ align }) => getAlignStyles(align)};
  ${({ theme, color }) => getColorStyles(theme.themeColors[color])};
  ${({ rotate }) => rotate && rotateStyles(rotate)};
`

export const Icon: FC<IconProps> = ({ ...props }) => {
  return <StyledIcon {...props} />
}

export default Icon
