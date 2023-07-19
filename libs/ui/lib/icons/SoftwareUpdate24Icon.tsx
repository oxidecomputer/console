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
const SoftwareUpdate24Icon = ({
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
    <g id="24/software-update">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.7072 1.70708C12.3167 1.31655 11.6835 1.31655 11.293 1.70708L7.70717 5.29286C7.07721 5.92283 7.52337 6.99997 8.41428 6.99997H15.5858C16.4768 6.99997 16.9229 5.92283 16.293 5.29287L12.7072 1.70708ZM2.00006 10.9999C2.00006 10.4476 2.44778 9.99993 3.00006 9.99993H21.0001C21.5523 9.99993 22.0001 10.4476 22.0001 10.9999V20.9999C22.0001 21.5522 21.5523 21.9999 21.0001 21.9999H3.00006C2.44778 21.9999 2.00006 21.5522 2.00006 20.9999V10.9999ZM11.293 13.707C11.6835 13.3165 12.3167 13.3165 12.7072 13.707L16.293 17.2928C16.9229 17.9228 16.4768 18.9999 15.5858 18.9999H8.41428C7.52337 18.9999 7.07721 17.9228 7.70717 17.2928L11.293 13.707Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default SoftwareUpdate24Icon
