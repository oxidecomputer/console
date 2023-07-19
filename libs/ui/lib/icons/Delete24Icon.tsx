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
const Delete24Icon = ({
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
    <g id="24/delete">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.5858 1C14.851 1 15.1054 1.10536 15.2929 1.29289L15.7071 1.70711C15.8946 1.89464 16.149 2 16.4142 2H20C20.5523 2 21 2.44772 21 3V4C21 4.55228 20.5523 5 20 5H4C3.44772 5 3 4.55228 3 4V3C3 2.44772 3.44772 2 4 2H7.58579C7.851 2 8.10536 1.89464 8.29289 1.70711L8.70711 1.29289C8.89464 1.10536 9.149 1 9.41421 1H14.5858ZM6 7C5.44772 7 5 7.44772 5 8V22C5 22.5523 5.44772 23 6 23H18C18.5523 23 19 22.5523 19 22V8C19 7.44772 18.5523 7 18 7H6ZM10 10C10.5523 10 11 10.4477 11 11V19C11 19.5523 10.5523 20 10 20H9C8.44772 20 8 19.5523 8 19V11C8 10.4477 8.44772 10 9 10H10ZM14 10C13.4477 10 13 10.4477 13 11V19C13 19.5523 13.4477 20 14 20H15C15.5523 20 16 19.5523 16 19V11C16 10.4477 15.5523 10 15 10H14Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Delete24Icon
