/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const WindowsDistroIcon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="distro/windows">
      <path
        id="Vector"
        d="M0 2.26533L6.53869 1.37758L6.54155 7.66524L0.00597308 7.70234L0 2.26533ZM6.53558 8.3897L6.54065 14.6828L0.00507529 13.7871L0.00470884 8.34749L6.53558 8.3897ZM7.32822 1.26144L15.998 0V7.58527L7.32822 7.65389V1.26144ZM16 8.44888L15.998 16L7.3282 14.7801L7.31605 8.43475L16 8.44888Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default WindowsDistroIcon
