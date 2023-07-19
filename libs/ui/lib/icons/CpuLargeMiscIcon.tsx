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
const CpuLargeMiscIcon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={19}
    height={19}
    viewBox="0 0 19 19"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="misc/cpu-large">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 4L11 4L11 1L10 1L10 4ZM14 5H5V14H14V5ZM11 18H10L10 15H11L11 18ZM8 4L9 4L9 1L8 1L8 4ZM9 18H8L8 15H9L9 18ZM6 4L7 4L7 1L6 1L6 4ZM7 18H6L6 15H7L7 18ZM12 4L13 4L13 1L12 1L12 4ZM13 18H12L12 15H13L13 18ZM15 10V11L18 11V10L15 10ZM1 11L1 10L4 10L4 11L1 11ZM15 8V9L18 9V8L15 8ZM1 9L1 8L4 8L4 9L1 9ZM15 6V7L18 7V6L15 6ZM1 7L1 6L4 6L4 7L1 7ZM15 12V13L18 13V12L15 12ZM1 13L1 12L4 12L4 13L1 13Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default CpuLargeMiscIcon
