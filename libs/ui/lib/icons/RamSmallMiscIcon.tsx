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
const RamSmallMiscIcon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={15}
    height={15}
    viewBox="0 0 15 15"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="misc/ram-small">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15 4H0V9H15L15 6.99999L14 6.99999L14 5.99999H15L15 4ZM1 6.99999L4.05312e-06 6.99999V5.99999H1L1 6.99999ZM0.999999 11H2L2 10H1L0.999999 11ZM4 11H3L3 10H4L4 11ZM5 11H6L6 10H5L5 11ZM8 11H7L7 10H8L8 11ZM9 11H10L10 10H9L9 11ZM12 11H11L11 10H12L12 11ZM14 11H13L13 10H14L14 11Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default RamSmallMiscIcon
