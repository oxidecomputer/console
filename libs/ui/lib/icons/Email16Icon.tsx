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
const Email16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/email">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.04879 10L4.60434 3H11.3957L12.9512 10H10.75C10.3358 10 10 10.3358 10 10.75V11.25C10 11.6642 9.66421 12 9.25 12H6.75C6.33579 12 6 11.6642 6 11.25V10.75C6 10.3358 5.66421 10 5.25 10H3.04879ZM2.86949 1.5873C2.94574 1.24415 3.2501 1 3.60163 1H12.3984C12.7499 1 13.0543 1.24415 13.1305 1.5873L14.9821 9.91963C14.994 9.97305 15 10.0276 15 10.0823V14.25C15 14.6642 14.6642 15 14.25 15H1.75C1.33579 15 1 14.6642 1 14.25V10.0823C1 10.0276 1.00599 9.97305 1.01786 9.91963L2.86949 1.5873Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Email16Icon
