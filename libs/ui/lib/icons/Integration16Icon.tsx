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
const Integration16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/integration">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.75 1C1.33579 1 1 1.33579 1 1.75V6.25C1 6.66421 1.33579 7 1.75 7H6.25C6.66421 7 7 6.66421 7 6.25V1.75C7 1.33579 6.66421 1 6.25 1H1.75ZM11 1.75C11 1.33579 11.3358 1 11.75 1H12.25C12.6642 1 13 1.33579 13 1.75V3H14.25C14.6642 3 15 3.33579 15 3.75V4.25C15 4.66421 14.6642 5 14.25 5H13V6.25C13 6.66421 12.6642 7 12.25 7H11.75C11.3358 7 11 6.66421 11 6.25V5H9.75C9.33579 5 9 4.66421 9 4.25V3.75C9 3.33579 9.33579 3 9.75 3H11V1.75ZM1 9.75C1 9.33579 1.33579 9 1.75 9H6.25C6.66421 9 7 9.33579 7 9.75V14.25C7 14.6642 6.66421 15 6.25 15H1.75C1.33579 15 1 14.6642 1 14.25V9.75ZM9.75 9C9.33579 9 9 9.33579 9 9.75V14.25C9 14.6642 9.33579 15 9.75 15H14.25C14.6642 15 15 14.6642 15 14.25V9.75C15 9.33579 14.6642 9 14.25 9H9.75Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Integration16Icon
