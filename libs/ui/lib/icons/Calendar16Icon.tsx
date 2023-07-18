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
const Calendar16Icon = ({
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
    <g id="16/calendar">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.75 3C1.33579 3 1 3.33579 1 3.75V6H15V3.75C15 3.33579 14.6642 3 14.25 3H13V1H11V3H5V1H3V3H1.75ZM1 7H15V14.25C15 14.6642 14.6642 15 14.25 15H1.75C1.33579 15 1 14.6642 1 14.25V7ZM3 9.75C3 9.33579 3.33579 9 3.75 9H6.25C6.66421 9 7 9.33579 7 9.75V12.25C7 12.6642 6.66421 13 6.25 13H3.75C3.33579 13 3 12.6642 3 12.25V9.75Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Calendar16Icon
