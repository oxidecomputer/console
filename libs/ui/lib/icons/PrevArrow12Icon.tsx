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
const PrevArrow12Icon = ({
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
    <g id="12/prev-arrow">
      <path
        id="Union"
        d="M8.53034 1.46968C8.23744 1.17678 7.76257 1.17678 7.46968 1.46968L3.46968 5.46968C3.17678 5.76257 3.17678 6.23744 3.46968 6.53034L7.46968 10.5303C7.76257 10.8232 8.23744 10.8232 8.53034 10.5303C8.82323 10.2374 8.82323 9.76257 8.53034 9.46968L5.06067 6.00001L8.53034 2.53034C8.82323 2.23744 8.82323 1.76257 8.53034 1.46968Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default PrevArrow12Icon
