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
const Security24Icon = ({
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
    <g id="24/security">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1C8.68629 1 6 3.68629 6 7V8.38462C6 8.72448 6.27552 9 6.61538 9H8.61538C8.8278 9 9 8.8278 9 8.61538V7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7V8.61538C15 8.8278 15.1722 9 15.3846 9H17.3846C17.7245 9 18 8.72448 18 8.38462V7C18 3.68629 15.3137 1 12 1ZM4 11C3.44772 11 3 11.4477 3 12V22C3 22.5523 3.44772 23 4 23H20C20.5523 23 21 22.5523 21 22V12C21 11.4477 20.5523 11 20 11H4ZM12 17C13.1046 17 14 16.1046 14 15C14 13.8954 13.1046 13 12 13C10.8954 13 10 13.8954 10 15C10 16.1046 10.8954 17 12 17Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Security24Icon
