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
const Disabled12Icon = ({
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
    <g id="12/disabled">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 12C9.31371 12 12 9.3137 12 5.99999C12 2.68628 9.31371 -9.26154e-06 6 -9.09295e-06C2.68629 -9.26154e-06 3.67839e-08 2.68628 2.89665e-07 5.99999C3.73959e-07 9.3137 2.68629 12 6 12ZM3.167 6.75C2.79863 6.75 2.5 6.45137 2.5 6.083L2.5 5.917C2.5 5.54863 2.79863 5.25 3.167 5.25H8.833C9.20137 5.25 9.5 5.54863 9.5 5.917L9.5 6.083C9.5 6.45137 9.20137 6.75 8.833 6.75L3.167 6.75Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Disabled12Icon
