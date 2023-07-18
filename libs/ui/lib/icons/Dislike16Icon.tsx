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
const Dislike16Icon = ({
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
    <g id="16/dislike">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.37876 14.5266L12 10L12 1L4.46368 1C4.1796 1 3.91991 1.1605 3.79286 1.41458L1 7L1 8C1 9.10457 1.89543 10 3 10H7L6.38911 12.4436C6.16176 13.353 6.59653 14.2983 7.43497 14.7175L7.4577 14.7288C7.77402 14.887 8.15783 14.8027 8.37876 14.5266ZM14.25 10C14.6642 10 15 9.66421 15 9.25L15 1.75C15 1.33579 14.6642 1 14.25 1H13L13 10H14.25Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Dislike16Icon
