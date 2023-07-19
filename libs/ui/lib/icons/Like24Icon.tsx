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
const Like24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="24/like">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5625 2.51179L7 9.01827V22H17.323C17.7319 22 18.0996 21.751 18.2514 21.3714L22 12V11.0183C22 9.9137 21.1046 9.01827 20 9.01827H14.4286L15.5272 4.81081C15.7932 3.79187 15.2236 2.74118 14.2245 2.40816L13.6388 2.21292C13.2526 2.0842 12.827 2.20239 12.5625 2.51179ZM2.75 8.99999C2.33579 8.99999 2 9.33578 2 9.74999V21.25C2 21.6642 2.33579 22 2.75 22H5V8.99999H2.75Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Like24Icon
