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
const Add12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="12/add">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.75 0.667C6.75 0.298626 6.45137 0 6.083 0H5.917C5.54863 0 5.25 0.298626 5.25 0.666999V5.25H0.667C0.298626 5.25 0 5.54863 0 5.917V6.083C0 6.45137 0.298626 6.75 0.667 6.75H5.25V11.333C5.25 11.7014 5.54863 12 5.917 12H6.083C6.45137 12 6.75 11.7014 6.75 11.333V6.75H11.333C11.7014 6.75 12 6.45137 12 6.083V5.917C12 5.54863 11.7014 5.25 11.333 5.25H6.75V0.667Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Add12Icon
