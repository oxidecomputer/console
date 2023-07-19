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
const Download24Icon = ({
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
    <g id="24/download">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM8.20711 13H11L11 7.00002C11 6.44773 11.4477 6.00002 12 6.00002C12.5523 6.00002 13 6.44773 13 7.00002V13H15.7929C16.2383 13 16.4614 13.5386 16.1464 13.8536L12.7071 17.2929C12.3166 17.6834 11.6834 17.6834 11.2929 17.2929L7.85356 13.8536C7.53858 13.5386 7.76166 13 8.20711 13Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Download24Icon
