import type { FC } from 'react'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid'
import type { Color } from '@oxide/theme'

import ArrowIcon from '../../assets/arrow.svg'
import BookmarkIcon from '../../assets/bookmark.svg'
import CheckDashIcon from '../../assets/check-d.svg'
import CheckEmptyIcon from '../../assets/check-e.svg'
import CheckOFilledIcon from '../../assets/check-o-filled.svg'
import CheckOIcon from '../../assets/check-o.svg'
import CheckSquareIcon from '../../assets/check-r.svg'
import CheckIcon from '../../assets/check.svg'
import ChevronIcon from '../../assets/chevron.svg'
import CloseIcon from '../../assets/close.svg'
import CommandIcon from '../../assets/command.svg'
import CopyIcon from '../../assets/copy.svg'
import CpuIcon from '../../assets/cpu.svg'
import DangerFilledIcon from '../../assets/danger-filled.svg'
import DangerIcon from '../../assets/danger.svg'
import DashboardIcon from '../../assets/dashboard.svg'
import ExternalIcon from '../../assets/external.svg'
import FileIcon from '../../assets/file.svg'
import FilterIcon from '../../assets/filter.svg'
import InfoFilledIcon from '../../assets/info-filled.svg'
import InfoIcon from '../../assets/info.svg'
import InstanceIcon from '../../assets/instance.svg'
import InstancesIcon from '../../assets/instances.svg'
import ListIcon from '../../assets/list.svg'
import MemoryIcon from '../../assets/memory.svg'
import MessageIcon from '../../assets/message.svg'
import MoreIcon from '../../assets/more.svg'
import NetworkingIcon from '../../assets/networking.svg'
import NotificationsIcon from '../../assets/notifications.svg'
import OrganizationIcon from '../../assets/org.svg'
import PenIcon from '../../assets/pen.svg'
import PlayOIcon from '../../assets/play-button-o.svg'
import PlayPauseOIcon from '../../assets/play-pause-o.svg'
import PlayStopOIcon from '../../assets/play-stop-o.svg'
import PlusIcon from '../../assets/plus.svg'
import ProfileIcon from '../../assets/profile.svg'
import ProhibitedIcon from '../../assets/prohibited.svg'
import ProjectIcon from '../../assets/project.svg'
import ProjectAltIcon from '../../assets/project-alt.svg'
import ProjectsIcon from '../../assets/projects.svg'
import PulseIcon from '../../assets/pulse.svg'
import RackIcon from '../../assets/rack.svg'
import RadioEIcon from '../../assets/radio-e.svg'
import RadioFIcon from '../../assets/radio-f.svg'
import ResourcesIcon from '../../assets/resources.svg'
import SearchIcon from '../../assets/search.svg'
import StopwatchIcon from '../../assets/stopwatch.svg'
import StorageIcon from '../../assets/storage.svg'
import SupportIcon from '../../assets/support.svg'
import ThemeIcon from '../../assets/theme.svg'
import TrashIcon from '../../assets/trash.svg'
import UserIcon from '../../assets/user.svg'
import UsersIcon from '../../assets/users.svg'
import ViewColsIcon from '../../assets/view-cols.svg'
import WarningFilledIcon from '../../assets/warning-filled.svg'
import WarningIcon from '../../assets/warning.svg'

export const icons = {
  arrow: ArrowIcon,
  bookmark: BookmarkIcon,
  checkDash: CheckDashIcon,
  checkEmpty: CheckEmptyIcon,
  checkOFilled: CheckOFilledIcon,
  checkO: CheckOIcon,
  checkSquare: CheckSquareIcon,
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
  list: ListIcon,
  memory: MemoryIcon,
  message: MessageIcon,
  more: MoreIcon,
  networking: NetworkingIcon,
  notifications: NotificationsIcon,
  organization: OrganizationIcon,
  pen: PenIcon,
  playO: PlayOIcon,
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

interface StyledIconProps {
  /**
   * Add optional margin
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
  if (!IconComponent) {
    console.warn('Cannot find icon for: ', name)
    return null
  }
  let addSvgProps = { ...svgProps }

  // All icons should have a default <title> tag
  // Generate a titleId here so that the `id` and corresponding `aria-labelledby`
  // attributes are always unique
  // TODO: Allow icon to have the equivalent of an empty alt="" tag
  if (!addSvgProps.titleId) {
    addSvgProps = { titleId: titleId, ...svgProps }
  }

  return <IconComponent {...addSvgProps} {...props} />
}

export const Icon = styled(SvgIcon).withConfig({
  shouldForwardProp: (prop) => {
    // Do not pass 'align', 'color', 'rotate' (etc) props to the DOM
    // but do pass 'svgProps' to SvgIcon
    return ['className', 'svgProps', 'name'].includes(prop)
  },
})<StyledIconProps>`
  align-self: center; /* displays correct height for Safari */
  flex-shrink: 0;

  height: auto;
  width: 1em; /* icon size is controlled by parent font-size */

  fill: ${({ color, theme }) =>
    color ? theme.themeColors[color] : 'currentColor'};

  ${({ rotate }) => rotate && `transform: rotate(${rotate})`};
  ${({ align }) => {
    if (align === 'left') {
      return `margin-right: 0.5em;`
    }
    if (align === 'right') {
      return `margin-left: 0.5em;`
    }
  }}
`

export default Icon
