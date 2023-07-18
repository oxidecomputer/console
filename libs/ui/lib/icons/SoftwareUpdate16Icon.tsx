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
const SoftwareUpdate16Icon = ({
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
    <g id="16/software-update">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.53034 1.53033C8.23744 1.23744 7.76257 1.23744 7.46968 1.53033L5.28033 3.71967C4.80786 4.19214 5.14248 5 5.81066 5H10.1893C10.8575 5 11.1921 4.19214 10.7197 3.71967L8.53034 1.53033ZM1 7.75C1 7.33579 1.33579 7 1.75 7H14.25C14.6642 7 15 7.33579 15 7.75V14.25C15 14.6642 14.6642 15 14.25 15H1.75C1.33579 15 1 14.6642 1 14.25V7.75ZM7.46968 9.53033C7.76257 9.23744 8.23744 9.23744 8.53034 9.53033L10.7197 11.7197C11.1921 12.1921 10.8575 13 10.1893 13H5.81066C5.14248 13 4.80786 12.1921 5.28033 11.7197L7.46968 9.53033Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default SoftwareUpdate16Icon
