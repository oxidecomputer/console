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
const Storage24Icon = ({
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
    <g id="24/storage">
      <path
        id="Vector"
        d="M18.3002 2.3753C18.1105 2.13809 17.8232 2 17.5194 2H17C16.4477 2 16 2.44772 16 3V6.1H5V3C5 2.44772 4.55228 2 4 2H3C2.44772 2 2 2.44772 2 3V21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21V7.35078C22 7.12371 21.9227 6.9034 21.7809 6.72609L18.3002 2.3753ZM12 18C9.8 18 8 16.2 8 14C8 11.8 9.8 10 12 10C14.2 10 16 11.8 16 14C16 16.2 14.2 18 12 18Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Storage24Icon
