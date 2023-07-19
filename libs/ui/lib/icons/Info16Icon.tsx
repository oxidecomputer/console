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
const Info16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/info">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM8.25 4C8.66421 4 9 4.33579 9 4.75V5.25C9 5.66421 8.66421 6 8.25 6H7.75C7.33579 6 7 5.66421 7 5.25V4.75C7 4.33579 7.33579 4 7.75 4H8.25ZM8.25 7C8.66421 7 9 7.33579 9 7.75V11.25C9 11.6642 8.66421 12 8.25 12H7.75C7.33579 12 7 11.6642 7 11.25V7.75C7 7.33579 7.33579 7 7.75 7H8.25Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Info16Icon
