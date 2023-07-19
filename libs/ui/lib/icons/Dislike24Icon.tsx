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
const Dislike24Icon = ({
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
    <g id="24/dislike">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.3282 23.6161L17 16.9817V4L5.78049 4C5.48048 4 5.20933 4.17879 5.09114 4.45455L1.00001 14V14.9817C1.00001 16.0863 1.89544 16.9817 3.00001 16.9817H9.57144L8.47282 21.1892C8.20677 22.2081 8.77643 23.2588 9.77549 23.5918L10.5209 23.8403C10.8105 23.9368 11.1298 23.8482 11.3282 23.6161ZM21.25 16.9818C21.6642 16.9818 22 16.646 22 16.2318V4.75003C22 4.33582 21.6642 4.00003 21.25 4.00003H19.1429V16.9818H21.25Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Dislike24Icon
