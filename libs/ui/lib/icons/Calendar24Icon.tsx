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
const Calendar24Icon = ({
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
    <g id="24/calendar">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 5C2.44772 5 2 5.44772 2 6V9H22V6C22 5.44772 21.5523 5 21 5H19V2H16V5H8V2H5V5H3ZM2 11H22V21C22 21.5523 21.5523 22 21 22H3C2.44772 22 2 21.5523 2 21V11ZM5 14H10V19H5V14Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Calendar24Icon
