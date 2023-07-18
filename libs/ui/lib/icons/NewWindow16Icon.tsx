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
const NewWindow16Icon = ({
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
    <g id="16/new-window">
      <path
        id="Icon"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.25 1H5.75C5.33579 1 5 1.33579 5 1.75V10.25C5 10.6642 5.33579 11 5.75 11H14.25C14.6642 11 15 10.6642 15 10.25V1.75C15 1.33579 14.6642 1 14.25 1ZM7 3.75C7 3.33579 7.33579 3 7.75 3H12.25C12.6642 3 13 3.33579 13 3.75V4.25C13 4.66421 12.6642 5 12.25 5H7.75C7.33579 5 7 4.66421 7 4.25V3.75ZM1.75 5H4V7H3V13H9V12H11V14.25C11 14.6642 10.6642 15 10.25 15H1.75C1.33579 15 1 14.6642 1 14.25V5.75C1 5.33579 1.33579 5 1.75 5Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default NewWindow16Icon
