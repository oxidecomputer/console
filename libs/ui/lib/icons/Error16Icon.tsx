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
const Error16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/error">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM4.99479 6.40901C4.7019 6.11612 4.7019 5.64124 4.99479 5.34835L5.34834 4.9948C5.64124 4.7019 6.11611 4.7019 6.409 4.9948L7.99999 6.58579L9.59098 4.9948C9.88388 4.7019 10.3588 4.7019 10.6516 4.9948L11.0052 5.34835C11.2981 5.64124 11.2981 6.11612 11.0052 6.40901L9.41421 8L11.0052 9.59099C11.2981 9.88388 11.2981 10.3588 11.0052 10.6517L10.6516 11.0052C10.3588 11.2981 9.88388 11.2981 9.59098 11.0052L7.99999 9.41421L6.409 11.0052C6.11611 11.2981 5.64124 11.2981 5.34834 11.0052L4.99479 10.6517C4.7019 10.3588 4.7019 9.88388 4.99479 9.59099L6.58578 8L4.99479 6.40901Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Error16Icon
