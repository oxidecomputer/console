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
const Warning12Icon = ({
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
    <g id="12/warning">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.59658 1.19316L11.5174 11.0347C11.7391 11.4782 11.4166 12 10.9208 12H1.07923C0.583392 12 0.260901 11.4782 0.482645 11.0347L5.40342 1.19316C5.64922 0.701552 6.35078 0.701553 6.59658 1.19316ZM6.083 4.00001C6.45138 4.00001 6.75 4.29863 6.75 4.66701V7.33301C6.75 7.70138 6.45138 8.00001 6.083 8.00001H5.917C5.54863 8.00001 5.25 7.70138 5.25 7.33301V4.66701C5.25 4.29863 5.54863 4.00001 5.917 4.00001H6.083ZM6.083 9.00001C6.45138 9.00001 6.75 9.29863 6.75 9.66701V9.83301C6.75 10.2014 6.45138 10.5 6.083 10.5H5.917C5.54863 10.5 5.25 10.2014 5.25 9.83301V9.66701C5.25 9.29863 5.54863 9.00001 5.917 9.00001H6.083Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Warning12Icon
