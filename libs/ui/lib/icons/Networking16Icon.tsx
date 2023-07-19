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
const Networking16Icon = ({
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
    <g id="16/networking">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.25 1H1.75C1.33579 1 1 1.33579 1 1.75V6.25C1 6.66421 1.33579 7 1.75 7H6.25C6.66421 7 7 6.66421 7 6.25V1.75C7 1.33579 6.66421 1 6.25 1ZM14.25 1H9.75C9.33579 1 9 1.33579 9 1.75V6.25C9 6.66421 9.33579 7 9.75 7H14.25C14.6642 7 15 6.66421 15 6.25V1.75C15 1.33579 14.6642 1 14.25 1ZM9.75 9H14.25C14.6642 9 15 9.33579 15 9.75V14.25C15 14.6642 14.6642 15 14.25 15H9.75C9.33579 15 9 14.6642 9 14.25V9.75C9 9.33579 9.33579 9 9.75 9ZM3.25 9H2.75C2.33579 9 2 9.33579 2 9.75V12V13.25C2 13.6642 2.33579 14 2.75 14H4H6.25C6.66421 14 7 13.6642 7 13.25V12.75C7 12.3358 6.66421 12 6.25 12H4V9.75C4 9.33579 3.66421 9 3.25 9Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Networking16Icon
