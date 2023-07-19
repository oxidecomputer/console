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
const Dots16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/dots">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.5 1.75C6.5 1.33579 6.83579 1 7.25 1H8.75C9.16421 1 9.5 1.33579 9.5 1.75V3.25C9.5 3.66421 9.16421 4 8.75 4H7.25C6.83579 4 6.5 3.66421 6.5 3.25V1.75ZM6.5 7.25C6.5 6.83579 6.83579 6.5 7.25 6.5H8.75C9.16421 6.5 9.5 6.83579 9.5 7.25V8.75C9.5 9.16421 9.16421 9.5 8.75 9.5H7.25C6.83579 9.5 6.5 9.16421 6.5 8.75V7.25ZM9.5 12.75C9.5 12.3358 9.16421 12 8.75 12H7.25C6.83579 12 6.5 12.3358 6.5 12.75V14.25C6.5 14.6642 6.83579 15 7.25 15H8.75C9.16421 15 9.5 14.6642 9.5 14.25V12.75Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Dots16Icon
