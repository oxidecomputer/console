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
const PersonGroup24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/person-group">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 12C18.7614 12 21 9.76142 21 7C21 4.23858 18.7614 2 16 2C13.2386 2 11 4.23858 11 7C11 9.76142 13.2386 12 16 12ZM14 14C11.2386 14 9 16.2386 9 19V21C9 21.5523 9.44772 22 10 22H22C22.5523 22 23 21.5523 23 21V19C23 16.2386 20.7614 14 18 14H14ZM9.13643 5.6177C9.04694 6.06454 8.99999 6.52674 8.99999 6.99991C8.99999 8.55708 9.50844 9.99549 10.3684 11.1582C9.6571 12.266 8.41426 13 6.99999 13C4.79085 13 2.99999 11.2091 2.99999 8.99997C2.99999 6.79083 4.79085 4.99997 6.99999 4.99997C7.78561 4.99997 8.51833 5.22646 9.13643 5.6177ZM8.2504 15.0061C7.46214 16.1388 7 17.5154 7 19V22H2C1.44772 22 1 21.5523 1 21V20C1 17.2385 3.23858 15 6 15H8C8.08397 15 8.16745 15.002 8.2504 15.0061Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default PersonGroup24Icon
