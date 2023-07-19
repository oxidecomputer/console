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
const More12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="12/more">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 1.667C5 1.29863 5.29863 1 5.667 1H6.333C6.70137 1 7 1.29863 7 1.667V2.333C7 2.70137 6.70137 3 6.333 3H5.667C5.29863 3 5 2.70137 5 2.333V1.667ZM5 5.667C5 5.29863 5.29863 5 5.667 5H6.333C6.70137 5 7 5.29863 7 5.667V6.333C7 6.70137 6.70137 7 6.333 7H5.667C5.29863 7 5 6.70137 5 6.333V5.667ZM7 9.667C7 9.29863 6.70137 9 6.333 9H5.667C5.29863 9 5 9.29863 5 9.667V10.333C5 10.7014 5.29863 11 5.667 11H6.333C6.70137 11 7 10.7014 7 10.333V9.667Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default More12Icon
