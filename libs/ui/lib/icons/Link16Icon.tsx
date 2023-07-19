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
const Link16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/link">
      <g id="Icon">
        <path
          d="M6.58578 12.2426L8.17677 10.6516C8.46967 10.3588 8.94454 10.3588 9.23743 10.6516L9.59099 11.0052C9.88388 11.2981 9.88388 11.773 9.59099 12.0659L8 13.6569C6.4379 15.2189 3.90524 15.2189 2.34314 13.6569C0.781046 12.0948 0.781046 9.56209 2.34314 8L3.93413 6.40901C4.22703 6.11611 4.7019 6.11611 4.99479 6.40901L5.34835 6.76256C5.64124 7.05545 5.64124 7.53033 5.34835 7.82322L3.75736 9.41421C2.97631 10.1953 2.97631 11.4616 3.75736 12.2426C4.5384 13.0237 5.80473 13.0237 6.58578 12.2426Z"
          fill="currentColor"
        />
        <path
          d="M12.0659 9.59099C11.773 9.88388 11.2981 9.88388 11.0052 9.59099L10.6516 9.23743C10.3588 8.94454 10.3588 8.46967 10.6516 8.17677L12.2426 6.58578C13.0237 5.80473 13.0237 4.5384 12.2426 3.75736C11.4616 2.97631 10.1953 2.97631 9.41421 3.75736L7.82322 5.34835C7.53033 5.64124 7.05545 5.64124 6.76256 5.34835L6.40901 4.99479C6.11611 4.7019 6.11611 4.22703 6.40901 3.93413L8 2.34314C9.56209 0.781046 12.0948 0.781045 13.6569 2.34314C15.2189 3.90524 15.2189 6.4379 13.6569 8L12.0659 9.59099Z"
          fill="currentColor"
        />
        <path
          d="M9.94454 5.7019C9.65165 5.40901 9.17677 5.40901 8.88388 5.7019L5.7019 8.88388C5.40901 9.17677 5.40901 9.65165 5.7019 9.94454L6.05545 10.2981C6.34835 10.591 6.82322 10.591 7.11611 10.2981L10.2981 7.11611C10.591 6.82322 10.591 6.34835 10.2981 6.05545L9.94454 5.7019Z"
          fill="currentColor"
        />
      </g>
    </g>
  </svg>
)
export default Link16Icon
