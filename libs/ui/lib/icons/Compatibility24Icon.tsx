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
const Compatibility24Icon = ({
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
    <g id="24/compatibility">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 3C2 2.44772 2.44772 2 3 2H21C21.5523 2 22 2.44772 22 3V11H16V7H8V11H2V3ZM16 13V17H22V21C22 21.5523 21.5523 22 21 22H3C2.44772 22 2 21.5523 2 21V17H8V13H16Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Compatibility24Icon
