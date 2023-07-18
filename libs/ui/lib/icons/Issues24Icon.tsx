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
const Issues24Icon = ({
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
    <g id="24/issues">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 1C5.44772 1 5 1.44772 5 2V21H4C3.44772 21 3 21.4477 3 22C3 22.5523 3.44772 23 4 23H8C8.55228 23 9 22.5523 9 22C9 21.4477 8.55228 21 8 21H7V12H13V14C13 14.5523 13.4477 15 14 15H20C20.5523 15 21 14.5523 21 14V7C21 6.44771 20.5523 6 20 6L16 6V4C16 3.44771 15.5523 3 15 3L7 3L7 2C7 1.44772 6.55228 1 6 1Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Issues24Icon
