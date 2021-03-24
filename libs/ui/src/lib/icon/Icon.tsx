import type { FC } from 'react'
import React, { useMemo } from 'react'
import styled, { css } from 'styled-components'
import { v4 as uuidv4 } from 'uuid'
import type { Color } from '@oxide/theme'

import { default as ArrowIcon } from '../../assets/arrow.svg'
import { default as BookmarkIcon } from '../../assets/bookmark.svg'
import { default as CheckDIcon } from '../../assets/check-d.svg'
import { default as CheckEIcon } from '../../assets/check-e.svg'
import { default as CheckOFilledIcon } from '../../assets/check-o-filled.svg'
import { default as CheckOIcon } from '../../assets/check-o.svg'
import { default as CheckRIcon } from '../../assets/check-r.svg'
import { default as CheckIcon } from '../../assets/check.svg'
import { default as ChevronIcon } from '../../assets/chevron.svg'
import { default as CloseIcon } from '../../assets/close.svg'
import { default as CommandIcon } from '../../assets/command.svg'
import { default as CopyIcon } from '../../assets/copy.svg'
import { default as CpuIcon } from '../../assets/cpu.svg'
import { default as DangerFilledIcon } from '../../assets/danger-filled.svg'
import { default as DangerIcon } from '../../assets/danger.svg'
import { default as DashboardIcon } from '../../assets/dashboard.svg'
import { default as ExternalIcon } from '../../assets/external.svg'
import { default as FileIcon } from '../../assets/file.svg'
import { default as FilterIcon } from '../../assets/filter.svg'
import { default as InfoFilledIcon } from '../../assets/info-filled.svg'
import { default as InfoIcon } from '../../assets/info.svg'
import { default as InstanceIcon } from '../../assets/instance.svg'
import { default as InstancesIcon } from '../../assets/instances.svg'
import { default as MemoryIcon } from '../../assets/memory.svg'
import { default as MessageIcon } from '../../assets/message.svg'
import { default as MoreIcon } from '../../assets/more.svg'
import { default as NetworkingIcon } from '../../assets/networking.svg'
import { default as NotificationsIcon } from '../../assets/notifications.svg'
import { default as OrganizationIcon } from '../../assets/org.svg'
import { default as PenIcon } from '../../assets/pen.svg'
import { default as PlayButtonOIcon } from '../../assets/play-button-o.svg'
import { default as PlayPauseOIcon } from '../../assets/play-pause-o.svg'
import { default as PlayStopOIcon } from '../../assets/play-stop-o.svg'
import { default as PlusIcon } from '../../assets/plus.svg'
import { default as ProfileIcon } from '../../assets/profile.svg'
import { default as ProhibitedIcon } from '../../assets/prohibited.svg'
import { default as ProjectIcon } from '../../assets/project.svg'
import { default as ProjectAltIcon } from '../../assets/project-alt.svg'
import { default as ProjectsIcon } from '../../assets/projects.svg'
import { default as PulseIcon } from '../../assets/pulse.svg'
import { default as RackIcon } from '../../assets/rack.svg'
import { default as RadioEIcon } from '../../assets/radio-e.svg'
import { default as RadioFIcon } from '../../assets/radio-f.svg'
import { default as ResourcesIcon } from '../../assets/resources.svg'
import { default as SearchIcon } from '../../assets/search.svg'
import { default as StopwatchIcon } from '../../assets/stopwatch.svg'
import { default as StorageIcon } from '../../assets/storage.svg'
import { default as SupportIcon } from '../../assets/support.svg'
import { default as ThemeIcon } from '../../assets/theme.svg'
import { default as TrashIcon } from '../../assets/trash.svg'
import { default as UserIcon } from '../../assets/user.svg'
import { default as UsersIcon } from '../../assets/users.svg'
import { default as ViewColsIcon } from '../../assets/view-cols.svg'
import { default as WarningFilledIcon } from '../../assets/warning-filled.svg'
import { default as WarningIcon } from '../../assets/warning.svg'

export const icons = {
  arrow: ArrowIcon,
  bookmark: BookmarkIcon,
  checkD: CheckDIcon,
  checkE: CheckEIcon,
  checkOFilled: CheckOFilledIcon,
  checkO: CheckOIcon,
  checkR: CheckRIcon,
  check: CheckIcon,
  chevron: ChevronIcon,
  close: CloseIcon,
  command: CommandIcon,
  copy: CopyIcon,
  cpu: CpuIcon,
  danger: DangerIcon,
  dangerFilled: DangerFilledIcon,
  dashboard: DashboardIcon,
  external: ExternalIcon,
  file: FileIcon,
  filter: FilterIcon,
  info: InfoIcon,
  infoFilled: InfoFilledIcon,
  instance: InstanceIcon,
  instances: InstancesIcon,
  memory: MemoryIcon,
  message: MessageIcon,
  more: MoreIcon,
  networking: NetworkingIcon,
  notifications: NotificationsIcon,
  organization: OrganizationIcon,
  pen: PenIcon,
  playButtonO: PlayButtonOIcon,
  playPauseO: PlayPauseOIcon,
  playStopO: PlayStopOIcon,
  plus: PlusIcon,
  prohibited: ProhibitedIcon,
  profile: ProfileIcon,
  project: ProjectIcon,
  projectAlt: ProjectAltIcon,
  projects: ProjectsIcon,
  pulse: PulseIcon,
  rack: RackIcon,
  radioE: RadioEIcon,
  radioF: RadioFIcon,
  resources: ResourcesIcon,
  search: SearchIcon,
  stopwatch: StopwatchIcon,
  storage: StorageIcon,
  support: SupportIcon,
  theme: ThemeIcon,
  trash: TrashIcon,
  user: UserIcon,
  users: UsersIcon,
  viewCols: ViewColsIcon,
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

const rotateStyles = (rotate: string) => {
  return css`
    transform: rotate(${rotate});
  `
}

interface StyledIconProps {
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

export const Icon = styled(SvgIcon).withConfig({
  // Do not pass 'color' and 'rotate' props to the DOM
  shouldForwardProp: (prop, defaultValidatorFn) =>
    !['color', 'rotate'].includes(prop) && defaultValidatorFn(prop),
})<StyledIconProps>`
  flex-shrink: 0;
  width: 1em; /* icon size is controlled by parent font-size */

  ${({ theme, color }) => color && getColorStyles(theme.themeColors[color])}
  ${({ rotate }) => rotate && rotateStyles(rotate)};
`

export default Icon
