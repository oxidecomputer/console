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
const Filter12Icon = ({
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
    <g id="12/filter">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 1.667C0 1.29863 0.298626 1 0.667 1H11.333C11.7014 1 12 1.29863 12 1.667V2.333C12 2.70137 11.7014 3 11.333 3H0.667C0.298626 3 0 2.70137 0 2.333V1.667ZM2 5.667C2 5.29863 2.29863 5 2.667 5H9.333C9.70137 5 10 5.29863 10 5.667V6.333C10 6.70137 9.70137 7 9.333 7H2.667C2.29863 7 2 6.70137 2 6.333V5.667ZM8 9.667C8 9.29863 7.70137 9 7.333 9H4.667C4.29863 9 4 9.29863 4 9.667V10.333C4 10.7014 4.29863 11 4.667 11H7.333C7.70137 11 8 10.7014 8 10.333V9.667Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Filter12Icon
