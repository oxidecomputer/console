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
const Like16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/like">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.62124 1.47345L4 6V15H11.5363C11.8204 15 12.0801 14.8395 12.2071 14.5854L15 9V8C15 6.89543 14.1046 6 13 6H9L9.61089 3.55644C9.83824 2.64703 9.40347 1.70173 8.56503 1.28252L8.5423 1.27115C8.22598 1.11299 7.84217 1.19729 7.62124 1.47345ZM1.75 6C1.33579 6 1 6.33579 1 6.75V14.25C1 14.6642 1.33579 15 1.75 15H3V6H1.75Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Like16Icon
