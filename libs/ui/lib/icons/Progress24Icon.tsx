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
const Progress24Icon = ({
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
    <g id="24/progress">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 1C17.4477 1 17 1.44772 17 2V22C17 22.5523 17.4477 23 18 23H20C20.5523 23 21 22.5523 21 22V2C21 1.44772 20.5523 1 20 1H18ZM10 9C10 8.44772 10.4477 8 11 8H13C13.5523 8 14 8.44772 14 9V22C14 22.5523 13.5523 23 13 23H11C10.4477 23 10 22.5523 10 22V9ZM3 16C3 15.4477 3.44772 15 4 15H6C6.55228 15 7 15.4477 7 16V22C7 22.5523 6.55228 23 6 23H4C3.44772 23 3 22.5523 3 22V16Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Progress24Icon
