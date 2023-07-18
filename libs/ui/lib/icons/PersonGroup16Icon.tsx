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
const PersonGroup16Icon = ({
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
    <g id="16/person-group">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.5 7C12.433 7 14 5.433 14 3.5C14 1.567 12.433 0 10.5 0C8.567 0 7 1.567 7 3.5C7 5.433 8.567 7 10.5 7ZM9 9C7.34314 9 6 10.3431 6 12V13.25C6 13.6642 6.33578 14 6.75 14H14.25C14.6642 14 15 13.6642 15 13.25V12C15 10.3431 13.6569 9 12 9H9ZM5.50817 3.21162C5.50274 3.30705 5.49999 3.40321 5.49999 3.5C5.49999 4.72927 5.9436 5.85492 6.67946 6.72562C6.25077 7.4863 5.43537 8 4.49999 8C3.11928 8 1.99999 6.88072 1.99999 5.5C1.99999 4.11929 3.11928 3 4.49999 3C4.85871 3 5.19979 3.07556 5.50817 3.21162ZM5.16891 10C4.74349 10.7354 4.5 11.5893 4.5 12.5V14H1.75C1.33579 14 1 13.6642 1 13.25V13C1 11.3431 2.34315 10 4 10H5.16891Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default PersonGroup16Icon
