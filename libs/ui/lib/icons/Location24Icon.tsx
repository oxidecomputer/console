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
const Location24Icon = ({
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
    <g id="24/location">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 7C18 9.973 15.8377 12.441 13 12.917V17H11V12.917C8.16229 12.441 6 9.973 6 7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7ZM21 20C21 21.6569 16.9706 23 12 23C7.02944 23 3 21.6569 3 20C3 18.4558 6.50005 17.1841 11 17.0183V20C11 20.5523 11.4477 21 12 21C12.5523 21 13 20.5523 13 20V17.0183C17.5 17.1841 21 18.4558 21 20Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Location24Icon
