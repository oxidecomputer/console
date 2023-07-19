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
const Document24Icon = ({
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
    <g id="24/document">
      <path
        id="Vector"
        d="M16.2929 1.29289C16.1054 1.10536 15.851 1 15.5858 1H4C3.44772 1 3 1.44772 3 2V22C3 22.5523 3.44772 23 4 23H20C20.5523 23 21 22.5523 21 22V6.41421C21 6.149 20.8946 5.89464 20.7071 5.70711L16.2929 1.29289ZM6 12C6 11.4477 6.44772 11 7 11H14C14.5523 11 15 11.4477 15 12C15 12.5523 14.5523 13 14 13H7C6.44772 13 6 12.5523 6 12ZM17 16C17 16.5523 16.5523 17 16 17H7C6.44772 17 6 16.5523 6 16C6 15.4477 6.44772 15 7 15H16C16.5523 15 17 15.4477 17 16ZM18 8C18 8.55228 17.5523 9 17 9H7C6.44772 9 6 8.55228 6 8C6 7.44772 6.44772 7 7 7H17C17.5523 7 18 7.44772 18 8Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Document24Icon
