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
const Folder16Icon = ({
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
    <g id="16/folder">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.75 2H8.52273C8.93694 2 9.27273 2.33579 9.27273 2.75V3.90909H1V2.75C1 2.33579 1.33579 2 1.75 2ZM1 5H14.25C14.6642 5 15 5.33579 15 5.75V13.25C15 13.6642 14.6642 14 14.25 14H1.75C1.33579 14 1 13.6642 1 13.25V5Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Folder16Icon
