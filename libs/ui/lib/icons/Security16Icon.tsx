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
const Security16Icon = ({
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
    <g id="16/security">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.75 7C4.33579 7 4 6.66421 4 6.25V5C4 2.79086 5.79086 1 8 1C10.2091 1 12 2.79086 12 5V6.25C12 6.66421 11.6642 7 11.25 7H10.75C10.3358 7 10 6.66421 10 6.25V5C10 3.89543 9.10457 3 8 3C6.89543 3 6 3.89543 6 5V6.25C6 6.66421 5.66421 7 5.25 7H4.75ZM2.75 8C2.33579 8 2 8.33579 2 8.75V14.25C2 14.6642 2.33579 15 2.75 15H13.25C13.6642 15 14 14.6642 14 14.25V8.75C14 8.33579 13.6642 8 13.25 8H2.75ZM8 12C8.55228 12 9 11.5523 9 11C9 10.4477 8.55228 10 8 10C7.44772 10 7 10.4477 7 11C7 11.5523 7.44772 12 8 12Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Security16Icon
