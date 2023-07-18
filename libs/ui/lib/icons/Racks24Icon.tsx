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
const Racks24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="24/racks">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 2C2.44772 2 2 2.44772 2 3V10C2 10.5523 2.44772 11 3 11H21C21.5523 11 22 10.5523 22 10V3C22 2.44772 21.5523 2 21 2H3ZM9 6.5C9 7.88071 7.88071 9 6.5 9C5.11929 9 4 7.88071 4 6.5C4 5.11929 5.11929 4 6.5 4C7.88071 4 9 5.11929 9 6.5ZM3 13C2.44772 13 2 13.4477 2 14V21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21V14C22 13.4477 21.5523 13 21 13H3ZM9 17.5C9 18.8807 7.88071 20 6.5 20C5.11929 20 4 18.8807 4 17.5C4 16.1193 5.11929 15 6.5 15C7.88071 15 9 16.1193 9 17.5Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Racks24Icon
