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
const Cloud24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/cloud">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 11C20 11.138 19.9965 11.2752 19.9896 11.4115C21.7611 12.1807 23 13.9457 23 16C23 18.7614 20.7614 21 18 21H7C3.68629 21 1 18.3137 1 15C1 12.7392 2.25045 10.7704 4.09747 9.74752C4.69862 5.9242 8.00782 3 12 3C16.4183 3 20 6.58172 20 11Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Cloud24Icon
