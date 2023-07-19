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
const DirectionDownIcon = ({
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
    <g id="Direction=Down">
      <g id="12/small-arrow">
        <path
          id="\xE2\x96\xB6"
          d="M5.40342 8.80683C5.64922 9.29844 6.35078 9.29844 6.59658 8.80683L9.51735 2.96529C9.7391 2.5218 9.41661 2 8.92077 2L3.07923 2C2.58339 2 2.2609 2.5218 2.48265 2.96529L5.40342 8.80683Z"
          fill="currentColor"
        />
      </g>
    </g>
  </svg>
)
export default DirectionDownIcon
