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
const Resize24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/resize">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19 5V11C19 11.5523 19.4477 12 20 12H21C21.5523 12 22 11.5523 22 11V5V3C22 2.96548 21.9983 2.93137 21.9948 2.89776C21.9436 2.3935 21.5178 2 21 2H19H13C12.4477 2 12 2.44772 12 3V4C12 4.55228 12.4477 5 13 5H19ZM7 8C7 7.44772 7.44772 7 8 7H16C16.5523 7 17 7.44772 17 8V16C17 16.5523 16.5523 17 16 17H8C7.44772 17 7 16.5523 7 16V8ZM5 19L5 13C5 12.4477 4.55228 12 4 12H3C2.44772 12 2 12.4477 2 13V19V21C2 21.5178 2.3935 21.9436 2.89776 21.9948C2.93137 21.9983 2.96548 22 3 22H5H11C11.5523 22 12 21.5523 12 21V20C12 19.4477 11.5523 19 11 19H5Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Resize24Icon
