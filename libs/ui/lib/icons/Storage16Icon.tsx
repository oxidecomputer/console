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
const Storage16Icon = ({
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
    <g id="16/storage">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.625 1C11.8611 1 12.0834 1.11115 12.225 1.3L14.85 4.8C14.9474 4.92982 15 5.08772 15 5.25V14.25C15 14.6642 14.6642 15 14.25 15H1.75C1.33579 15 1 14.6642 1 14.25V1.75C1 1.33579 1.33579 1 1.75 1H2.25C2.66421 1 3 1.33579 3 1.75V5H10V1.75C10 1.33579 10.3358 1 10.75 1H11.625ZM8 12C9.10457 12 10 11.1046 10 10C10 8.89543 9.10457 8 8 8C6.89543 8 6 8.89543 6 10C6 11.1046 6.89543 12 8 12Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Storage16Icon
