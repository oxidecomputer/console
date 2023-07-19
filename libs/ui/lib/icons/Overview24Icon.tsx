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
const Overview24Icon = ({
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
    <g id="24/overview">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 3C11 2.44772 10.5523 2 10 2H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H10C10.5523 14 11 13.5523 11 13V3ZM22 3C22 2.44772 21.5523 2 21 2H14C13.4477 2 13 2.44772 13 3V7C13 7.55228 13.4477 8 14 8H21C21.5523 8 22 7.55228 22 7V3ZM2 17C2 16.4477 2.44772 16 3 16H10C10.5523 16 11 16.4477 11 17V21C11 21.5523 10.5523 22 10 22H3C2.44772 22 2 21.5523 2 21V17ZM22 11C22 10.4477 21.5523 10 21 10H14C13.4477 10 13 10.4477 13 11V21C13 21.5523 13.4477 22 14 22H21C21.5523 22 22 21.5523 22 21V11Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Overview24Icon
