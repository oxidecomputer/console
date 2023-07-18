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
const DirectionLeftIcon = ({
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
    <g id="Direction=Left">
      <g id="12/small-arrow">
        <path
          id="\xE2\x96\xB6"
          d="M3.19317 5.40342C2.70155 5.64922 2.70155 6.35078 3.19317 6.59658L9.03471 9.51735C9.4782 9.7391 10 9.41661 10 8.92077L10 3.07923C10 2.58339 9.4782 2.2609 9.03471 2.48265L3.19317 5.40342Z"
          fill="currentColor"
        />
      </g>
    </g>
  </svg>
)
export default DirectionLeftIcon
