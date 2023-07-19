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
const NextArrow12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="12/next-arrow">
      <path
        id="Union"
        d="M3.46968 1.46968C3.76257 1.17678 4.23744 1.17678 4.53034 1.46968L8.53034 5.46968C8.82323 5.76257 8.82323 6.23744 8.53034 6.53034L4.53034 10.5303C4.23744 10.8232 3.76257 10.8232 3.46968 10.5303C3.17678 10.2374 3.17678 9.76257 3.46968 9.46968L6.93935 6.00001L3.46968 2.53034C3.17678 2.23744 3.17678 1.76257 3.46968 1.46968Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default NextArrow12Icon
